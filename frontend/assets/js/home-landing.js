
/* ===== mini WebGL2 engine: flat-shaded industrial look, no external library ===== */
var GLX = (function () {
  var gl, progs = {}, W = 1, H = 1, dpr = 1;

  /* ---------- math (column-major) ---------- */
  function ident() { return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]; }
  function mul(a, b) {
    var o = new Array(16), i, j;
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++)
      o[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
    return o;
  }
  function persp(fov, asp, n, f) {
    var t = 1 / Math.tan(fov / 2);
    return [t / asp,0,0,0, 0,t,0,0, 0,0,(f + n) / (n - f),-1, 0,0,2 * f * n / (n - f),0];
  }
  function sub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0]/l, a[1]/l, a[2]/l]; }
  function cross(a, b) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
  function dot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
  function lookAt(e, c, u) {
    var z = norm(sub(e, c)), x = norm(cross(u, z)), y = cross(z, x);
    return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -dot(x,e),-dot(y,e),-dot(z,e),1];
  }
  function T(x, y, z) { return [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]; }
  function RX(a) { var c = Math.cos(a), s = Math.sin(a); return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1]; }
  function RY(a) { var c = Math.cos(a), s = Math.sin(a); return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]; }
  function RZ(a) { var c = Math.cos(a), s = Math.sin(a); return [c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1]; }
  function SC(s) { return [s,0,0,0, 0,s,0,0, 0,0,s,0, 0,0,0,1]; }
  function xf(m, p) {
    return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12], m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14], m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15]];
  }
  function xn(m, p) { return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2], m[1]*p[0]+m[5]*p[1]+m[9]*p[2], m[2]*p[0]+m[6]*p[1]+m[10]*p[2]]; }

  /* ---------- matrix stack ---------- */
  var S = [ident()];
  function top() { return S[S.length - 1]; }
  function push() { S.push(top().slice()); }
  function pop() { S.pop(); }
  function tr(x, y, z) { S[S.length - 1] = mul(top(), T(x, y, z)); }
  function rx(a) { S[S.length - 1] = mul(top(), RX(a)); }
  function ry(a) { S[S.length - 1] = mul(top(), RY(a)); }
  function rz(a) { S[S.length - 1] = mul(top(), RZ(a)); }

  /* ---------- geometry builders: {p,n,e} flat arrays ---------- */
  function G() { return { p: [], n: [], e: [] }; }
  function tri(g, a, b, c, n) { g.p.push(a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2]); g.n.push(n[0],n[1],n[2], n[0],n[1],n[2], n[0],n[1],n[2]); }
  function quad(g, a, b, c, d, n) { tri(g, a, b, c, n); tri(g, a, c, d, n); }
  function seg(g, a, b) { g.e.push(a[0],a[1],a[2], b[0],b[1],b[2]); }
  function box(w, h, d, noEdges) {
    var x = w / 2, y = h / 2, z = d / 2, g = G();
    var v = [[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]];
    quad(g, v[4], v[5], v[6], v[7], [0,0,1]); quad(g, v[1], v[0], v[3], v[2], [0,0,-1]);
    quad(g, v[5], v[1], v[2], v[6], [1,0,0]); quad(g, v[0], v[4], v[7], v[3], [-1,0,0]);
    quad(g, v[7], v[6], v[2], v[3], [0,1,0]); quad(g, v[0], v[1], v[5], v[4], [0,-1,0]);
    if (!noEdges) [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(function (k) { seg(g, v[k[0]], v[k[1]]); });
    return g;
  }
  function cyl(rt, rb, h, n, edges) {
    var g = G(), y = h / 2, i, a0, a1, c0, s0, c1, s1, sl = (rb - rt) / h, ny;
    n = n || 32;
    for (i = 0; i < n; i++) {
      a0 = i / n * Math.PI * 2; a1 = (i + 1) / n * Math.PI * 2;
      c0 = Math.cos(a0); s0 = Math.sin(a0); c1 = Math.cos(a1); s1 = Math.sin(a1);
      var n0 = norm([c0, sl, s0]), n1 = norm([c1, sl, s1]);
      g.p.push(rb*c0,-y,rb*s0, rb*c1,-y,rb*s1, rt*c1,y,rt*s1,  rb*c0,-y,rb*s0, rt*c1,y,rt*s1, rt*c0,y,rt*s0);
      g.n.push(n0[0],n0[1],n0[2], n1[0],n1[1],n1[2], n1[0],n1[1],n1[2],  n0[0],n0[1],n0[2], n1[0],n1[1],n1[2], n0[0],n0[1],n0[2]);
      if (rt > 0) tri(g, [0,y,0], [rt*c1,y,rt*s1], [rt*c0,y,rt*s0], [0,1,0]);
      if (rb > 0) tri(g, [0,-y,0], [rb*c0,-y,rb*s0], [rb*c1,-y,rb*s1], [0,-1,0]);
      if (edges !== false) {
        if (rt > 0) seg(g, [rt*c0,y,rt*s0], [rt*c1,y,rt*s1]);
        if (rb > 0) seg(g, [rb*c0,-y,rb*s0], [rb*c1,-y,rb*s1]);
      }
    }
    return g;
  }
  function sphere(r, seg_, hemi) {
    var g = G(), i, j, la = hemi ? seg_ / 2 : seg_, p = function (u, v) {
      var th = u / seg_ * Math.PI * 2, ph = v / seg_ * Math.PI; // ph 0..PI (top to bottom)
      return [r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)];
    };
    for (j = 0; j < la; j++) for (i = 0; i < seg_; i++) {
      var a = p(i, j), b = p(i + 1, j), c = p(i + 1, j + 1), d = p(i, j + 1);
      g.p.push(a[0],a[1],a[2], c[0],c[1],c[2], b[0],b[1],b[2],  a[0],a[1],a[2], d[0],d[1],d[2], c[0],c[1],c[2]);
      [a, c, b, a, d, c].forEach(function (q) { var nn = norm(q); g.n.push(nn[0], nn[1], nn[2]); });
    }
    return g;
  }
  function torus(R, r, a, b) {
    var g = G(), i, j;
    function P(u, v) {
      var th = u / a * Math.PI * 2, ph = v / b * Math.PI * 2;
      return { p: [(R + r * Math.cos(ph)) * Math.cos(th), r * Math.sin(ph), (R + r * Math.cos(ph)) * Math.sin(th)], n: [Math.cos(ph) * Math.cos(th), Math.sin(ph), Math.cos(ph) * Math.sin(th)] };
    }
    for (i = 0; i < a; i++) for (j = 0; j < b; j++) {
      var q = [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)];
      [0, 2, 1, 0, 3, 2].forEach(function (k) { g.p.push.apply(g.p, q[k].p); g.n.push.apply(g.n, q[k].n); });
    }
    return g;
  }
  function merge(list) {
    var g = G();
    list.forEach(function (it) {
      var m = it[1], s = it[0], i;
      for (i = 0; i < s.p.length; i += 3) { var q = xf(m, [s.p[i], s.p[i+1], s.p[i+2]]); g.p.push(q[0], q[1], q[2]); }
      for (i = 0; i < s.n.length; i += 3) { var w = norm(xn(m, [s.n[i], s.n[i+1], s.n[i+2]])); g.n.push(w[0], w[1], w[2]); }
      for (i = 0; i < s.e.length; i += 3) { var u = xf(m, [s.e[i], s.e[i+1], s.e[i+2]]); g.e.push(u[0], u[1], u[2]); }
    });
    return g;
  }
  /* flat ribbon along a polyline on the floor; attribute S = distance along the path */
  function ribbon(pts, w, y) {
    var out = [], d = 0, i;
    for (i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = -dz / L * w / 2, nz = dx / L * w / 2;
      out.push(a[0]+nx,y,a[1]+nz,d, a[0]-nx,y,a[1]-nz,d, b[0]-nx,y,b[1]-nz,d+L,  a[0]+nx,y,a[1]+nz,d, b[0]-nx,y,b[1]-nz,d+L, b[0]+nx,y,b[1]+nz,d+L);
      d += L;
    }
    return { s4: out, len: d };
  }
  function annulus(r0, r1, n) {
    var out = [], i;
    for (i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, b = (i + 1) / n * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      out.push(r0*ca,0,r0*sa,0, r1*ca,0,r1*sa,0, r1*cb,0,r1*sb,0,  r0*ca,0,r0*sa,0, r1*cb,0,r1*sb,0, r0*cb,0,r0*sb,0);
    }
    return { s4: out, len: 0 };
  }

  /* ---------- GL plumbing ---------- */
  function sh(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function prog(name, vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, '#version 300 es\n' + vs));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, '#version 300 es\nprecision highp float;\n' + fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS), i;
    for (i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name.replace('[0]', '')] = gl.getUniformLocation(p, info.name); }
    progs[name] = { p: p, u: u };
  }
  function use(name) { var P = progs[name]; gl.useProgram(P.p); return P.u; }

  function upload(g) {
    var o = { n: g.p.length / 3, en: g.e.length / 3 };
    if (o.n) {
      var buf = new Float32Array(o.n * 6), i;
      for (i = 0; i < o.n; i++) { buf.set([g.p[i*3], g.p[i*3+1], g.p[i*3+2], g.n[i*3], g.n[i*3+1], g.n[i*3+2]], i * 6); }
      o.vao = gl.createVertexArray(); gl.bindVertexArray(o.vao);
      var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    }
    if (o.en) {
      o.evao = gl.createVertexArray(); gl.bindVertexArray(o.evao);
      var eb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, eb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.e), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0);
    }
    gl.bindVertexArray(null);
    return o;
  }
  function uploadFlat(r) {
    var o = { n: r.s4.length / 4, len: r.len };
    o.vao = gl.createVertexArray(); gl.bindVertexArray(o.vao);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(r.s4), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12);
    gl.bindVertexArray(null); return o;
  }
  function srgb(h) { var r = ((h >> 16) & 255) / 255, g = ((h >> 8) & 255) / 255, b = (h & 255) / 255; return [Math.pow(r, 2.2), Math.pow(g, 2.2), Math.pow(b, 2.2)]; }

  var REFL = 1;
  var cam = { eye: [0, 0, 0], vp: ident(), view: ident(), proj: ident() };
  var FOG = srgb(0x070707);

  function init(canvas) {
    gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return null;
    prog('mesh',
      'layout(location=0) in vec3 aP; layout(location=1) in vec3 aN; uniform mat4 uVP, uM; out vec3 vN; out vec3 vW;' +
      'void main(){ vec4 w = uM * vec4(aP, 1.); vW = w.xyz; vN = mat3(uM) * aN; gl_Position = uVP * w; }',
      'in vec3 vN; in vec3 vW; uniform vec3 uCol, uEye, uFog; uniform float uEm, uRefl; out vec4 o;' +
      'void main(){' +
      ' vec3 n = normalize(vN); vec3 L = normalize(vec3(-0.45, 1.0, 0.55)); vec3 L2 = normalize(vec3(0.8, 0.35, -0.5));' +
      ' float d = max(dot(n, L), 0.); float d2 = max(dot(n, L2), 0.) * 0.3; float hemi = 0.5 + 0.5 * n.y;' +
      ' vec3 V = normalize(uEye - vW); float rim = pow(1. - max(dot(n, V), 0.), 3.);' +
      ' float ao = mix(0.5, 1., smoothstep(0., 1.6, abs(vW.y)));' +
      ' vec3 c = uCol * (0.16 + 0.34 * hemi + 0.85 * d + d2) * ao + rim * 0.12 * (0.3 + uCol);' +
      ' c = mix(c, uCol, uEm); c *= uRefl;' +
      ' float dist = length(uEye - vW); float f = 1. - exp(-pow(dist * 0.021, 2.));' +
      ' c = mix(c, uFog, f); o = vec4(pow(c, vec3(1. / 2.2)), 1.); }');
    prog('line',
      'layout(location=0) in vec3 aP; uniform mat4 uVP, uM; out vec3 vW; void main(){ vec4 w = uM * vec4(aP, 1.); vW = w.xyz; gl_Position = uVP * w; }',
      'in vec3 vW; uniform vec3 uCol, uEye; uniform float uA, uRefl; out vec4 o; void main(){ float dist = length(uEye - vW); float f = exp(-pow(dist * 0.021, 2.) * 1.4); o = vec4(uCol, uA * f * uRefl); }');
    prog('floor',
      'layout(location=0) in vec3 aP; layout(location=1) in vec3 aN; uniform mat4 uVP; out vec3 vW; void main(){ vW = aP; gl_Position = uVP * vec4(aP, 1.); }',
      'in vec3 vW; uniform vec3 uEye, uFog; uniform vec4 uSh[10]; uniform float uT, uAlpha; out vec4 o;' +
      'float sdb(vec2 p, vec2 b){ vec2 d = abs(p) - b; return length(max(d, 0.)) + min(max(d.x, d.y), 0.); }' +
      'float grid(vec2 p, float s, float w){ vec2 g = abs(fract(p / s - 0.5) - 0.5) / fwidth(p / s); return 1. - min(min(g.x, g.y) / w, 1.); }' +
      'void main(){' +
      ' vec2 p = vW.xz; float r = length(p);' +
      ' vec3 c = vec3(0.006, 0.006, 0.007);' +
      ' float pool = exp(-r * r / 150.); c += vec3(0.022) * pool;' +
      ' float g1 = grid(p, 1., 1.0) * 0.5 + grid(p, 5., 1.4) * 0.9;' +
      ' float gf = exp(-r * r / 520.); c += vec3(0.05) * g1 * gf;' +
      ' float sh = 1.; for (int i = 0; i < 10; i++) { vec4 s = uSh[i]; if (s.z > 0.) { float dd = sdb(p - s.xy, s.zw); sh *= 1. - 0.82 * (1. - smoothstep(0., 1.1, dd)); } }' +
      ' c *= sh;' +
      ' vec3 hubGlow = vec3(1., 0.47, 0.) * exp(-r * r / 5.5) * 0.10; c += hubGlow;' +
      ' float dist = length(uEye - vW); float f = 1. - exp(-pow(dist * 0.021, 2.)); c = mix(c, uFog, f);' +
      ' o = vec4(pow(c, vec3(1. / 2.2)), uAlpha * (1. - f)); }');
    prog('flat',
      'layout(location=0) in vec3 aP; layout(location=1) in float aS; uniform mat4 uVP, uM; out float vS; out vec3 vW; void main(){ vec4 w = uM * vec4(aP, 1.); vW = w.xyz; vS = aS; gl_Position = uVP * w; }',
      'in float vS; in vec3 vW; uniform vec3 uCol, uEye; uniform float uA, uT, uMode, uPh; out vec4 o;' +
      'void main(){ float dist = length(uEye - vW); float f = exp(-pow(dist * 0.021, 2.) * 1.4); float a = uA;' +
      ' vec3 c = uCol;' +
      ' if (uMode > 0.5) { float p = fract((vS - uT * 2.6 - uPh) / 7.); float g = smoothstep(0.62, 1., p); g = g * g; c = mix(uCol, vec3(1., 0.78, 0.5), g * 0.55); a = uA * (0.5 + 1.3 * g); }' +
      ' o = vec4(c, min(a, 1.) * f); }');
    prog('point',
      'layout(location=0) in vec3 aP; layout(location=1) in float aK; uniform mat4 uVP; uniform float uSize, uScale; void main(){ gl_Position = uVP * vec4(aP, 1.); gl_PointSize = max(uSize * aK * uScale / gl_Position.w, 1.); }',
      'uniform vec3 uCol; uniform float uA; out vec4 o; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.; float a = pow(max(1. - r, 0.), 2.2); o = vec4(uCol, a * uA); }');

    prog('bg',
      'out vec2 vUv; void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); vUv = p; gl_Position = vec4(p * 2. - 1., 0., 1.); }',
      'in vec2 vUv; uniform float iTime, uAmt; uniform vec3 uBg, uA, uB; out vec4 o;' +
      'vec3 warp3d(vec3 pos, float t){ float curv=.8,a=1.9,b=0.7; pos*=2.; pos.x+=curv*sin(t+a*pos.y)+t*b; pos.y+=curv*cos(t+a*pos.x); pos.y+=curv*sin(t+a*pos.z)+t*b; pos.z+=curv*cos(t+a*pos.y); pos.z+=curv*sin(t+a*pos.x)+t*b; pos.x+=curv*cos(t+a*pos.z); return 0.5+0.5*cos(pos.xyz+vec3(1,2,4)); }' +
      'void main(){ vec2 uv = 2. * vUv - 1.; vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime * 1.5), vec3(1.5));' +
      ' vec3 flame = 1.5 * uA * w.x; flame *= w.y; flame += uB * w.z; flame *= smoothstep(0.25, 1., abs(uv.y));' +
      ' float md = smoothstep(-0.7, 1., -uv.y * uv.x); flame *= md * md;' +
      ' vec3 bg = uBg * (1.0 - 0.4 * length(uv)); o = vec4(bg + flame * uAmt, 1.); }');
    prog('blur',
      'out vec2 vUv; void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); vUv = p; gl_Position = vec4(p * 2. - 1., 0., 1.); }',
      'in vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir; uniform float uMode, uThr; out vec4 o;' +
      'void main(){ vec3 c = vec3(0.);' +
      ' if (uMode < 0.5) { vec2 px = uDir; for (int i = 0; i < 4; i++) { vec2 off = vec2(float(i & 1) - 0.5, float(i >> 1) - 0.5) * px; vec3 s = texture(uTex, vUv + off).rgb; float l = max(max(s.r, s.g), s.b); c += s * smoothstep(uThr, uThr + 0.35, l); } c *= 0.25; }' +
      ' else { float w[5]; w[0] = 0.227027; w[1] = 0.194595; w[2] = 0.121622; w[3] = 0.054054; w[4] = 0.016216; c = texture(uTex, vUv).rgb * w[0];' +
      '  for (int i = 1; i < 5; i++) { c += texture(uTex, vUv + uDir * float(i)).rgb * w[i]; c += texture(uTex, vUv - uDir * float(i)).rgb * w[i]; } }' +
      ' o = vec4(c, 1.); }');
    prog('comp',
      'out vec2 vUv; void main(){ vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); vUv = p; gl_Position = vec4(p * 2. - 1., 0., 1.); }',
      'in vec2 vUv; uniform sampler2D uTex; uniform float uK; out vec4 o; void main(){ o = vec4(texture(uTex, vUv).rgb * uK, 1.); }');
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL);
    return gl;
  }

  function resize(w, h, ratio) {
    W = w; H = h; dpr = ratio;
    gl.canvas.width = Math.round(w * ratio); gl.canvas.height = Math.round(h * ratio);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    try { setupPost(); } catch (err) { bl = null; }
  }
  function frame(eye, target, fov, shiftX, shiftY) {
    cam.eye = eye;
    cam.view = lookAt(eye, target, [0, 1, 0]);
    cam.proj = persp(fov, W / H, 0.5, 140);
    var vp = mul(cam.proj, cam.view);
    var sx = shiftX || 0, sy = shiftY || 0;
    if (sx || sy) vp = mul([1,0,0,0, 0,1,0,0, 0,0,1,0, sx,sy,0,1], vp);
    cam.vp = vp;
    gl.clearColor(FOG[0] > 0 ? Math.pow(FOG[0], 1 / 2.2) : 0, Math.pow(FOG[1], 1 / 2.2), Math.pow(FOG[2], 1 / 2.2), 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    S = [ident()];
  }
  function project(p) {
    var c = xf(cam.vp, p);
    return { x: (c[0] / c[3] * 0.5 + 0.5) * W, y: (1 - (c[1] / c[3] * 0.5 + 0.5)) * H, w: c[3] };
  }

  /* ---------- draw helpers ---------- */
  function mesh(geo, col, em, edge) {
    if (geo.n) {
      var u = use('mesh');
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1, 1);
      gl.uniformMatrix4fv(u.uVP, false, cam.vp); gl.uniformMatrix4fv(u.uM, false, top());
      gl.uniform3fv(u.uCol, col); gl.uniform3fv(u.uEye, cam.eye); gl.uniform3fv(u.uFog, FOG); gl.uniform1f(u.uEm, em || 0); gl.uniform1f(u.uRefl, REFL);
      gl.bindVertexArray(geo.vao); gl.drawArrays(gl.TRIANGLES, 0, geo.n);
      gl.disable(gl.POLYGON_OFFSET_FILL);
    }
    if (edge && geo.en) {
      var l = use('line');
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniformMatrix4fv(l.uVP, false, cam.vp); gl.uniformMatrix4fv(l.uM, false, top());
      gl.uniform3fv(l.uCol, edge.slice(0, 3)); gl.uniform1f(l.uA, edge[3]); gl.uniform1f(l.uRefl, REFL); gl.uniform3fv(l.uEye, cam.eye);
      gl.bindVertexArray(geo.evao); gl.drawArrays(gl.LINES, 0, geo.en);
      gl.disable(gl.BLEND);
    }
  }
  function floor(shadows, t) {
    var u = use('floor');
    gl.uniformMatrix4fv(u.uVP, false, cam.vp); gl.uniform3fv(u.uEye, cam.eye); gl.uniform3fv(u.uFog, FOG); gl.uniform1f(u.uT, t); gl.uniform1f(u.uAlpha, 0.8);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var arr = new Float32Array(40); shadows.forEach(function (s, i) { if (i < 10) arr.set(s, i * 4); });
    gl.uniform4fv(u.uSh, arr);
    if (!floor.geo) {
      var g = G(), R = 90; quad(g, [-R,0,-R], [-R,0,R], [R,0,R], [R,0,-R], [0,1,0]); floor.geo = upload(g);
    }
    gl.bindVertexArray(floor.geo.vao); gl.drawArrays(gl.TRIANGLES, 0, floor.geo.n); gl.disable(gl.BLEND);
  }
  function flat(geo, col, alpha, t, mode, phase, additive) {
    var u = use('flat');
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.uniformMatrix4fv(u.uVP, false, cam.vp); gl.uniformMatrix4fv(u.uM, false, top());
    gl.uniform3fv(u.uCol, col); gl.uniform3fv(u.uEye, cam.eye); gl.uniform1f(u.uA, alpha); gl.uniform1f(u.uT, t); gl.uniform1f(u.uMode, mode || 0); gl.uniform1f(u.uPh, phase || 0);
    gl.bindVertexArray(geo.vao); gl.drawArrays(gl.TRIANGLES, 0, geo.n);
    gl.depthMask(true); gl.disable(gl.BLEND);
  }
  function points(vao, n, col, alpha, size) {
    var u = use('point');
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.depthMask(false);
    gl.uniformMatrix4fv(u.uVP, false, cam.vp); gl.uniform3fv(u.uCol, col); gl.uniform1f(u.uA, alpha);
    gl.uniform1f(u.uSize, size); gl.uniform1f(u.uScale, H * dpr * 0.5 / Math.tan(0.26));
    gl.bindVertexArray(vao); gl.drawArrays(gl.POINTS, 0, n);
    gl.depthMask(true); gl.disable(gl.BLEND);
  }
  function pointBuf(arr4) {
    var vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr4), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12);
    gl.bindVertexArray(null); return { vao: vao, buf: b };
  }
  function pointUpdate(pb, arr4) { gl.bindBuffer(gl.ARRAY_BUFFER, pb.buf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(arr4)); }


  /* ---------- post: bloom + animated corner flame ---------- */
  var bl = null, emptyVao = null;
  function mkTex(w, h, filter, rgb) {
    var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, rgb ? gl.RGB : gl.RGBA, w, h, 0, rgb ? gl.RGB : gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function mkTarget(w, h) {
    var tex = mkTex(w, h, gl.LINEAR), fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex: tex, fb: fb, w: w, h: h, ok: ok };
  }
  function setupPost() {
    var pw = gl.canvas.width, ph = gl.canvas.height, sw = Math.max(2, pw >> 2), sh_ = Math.max(2, ph >> 2);
    bl = { src: mkTex(pw, ph, gl.LINEAR, !gl.getContextAttributes().alpha), a: mkTarget(sw, sh_), b: mkTarget(sw, sh_), pw: pw, ph: ph, sw: sw, sh: sh_ };
    bl.ok = bl.a.ok && bl.b.ok;
    if (!emptyVao) emptyVao = gl.createVertexArray();
  }
  function background(t, bg, a, b, amt) {
    gl.disable(gl.DEPTH_TEST); gl.depthMask(false);
    var u = use('bg'); gl.uniform1f(u.iTime, t); gl.uniform1f(u.uAmt, amt); gl.uniform3fv(u.uBg, bg); gl.uniform3fv(u.uA, a); gl.uniform3fv(u.uB, b);
    gl.bindVertexArray(emptyVao); gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
  }
  function bloom(strength, thr) {
    if (!bl || !bl.ok) return;
    gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.disable(gl.BLEND);
    gl.bindTexture(gl.TEXTURE_2D, bl.src); gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, bl.pw, bl.ph);
    var u = use('blur'); gl.bindVertexArray(emptyVao); gl.activeTexture(gl.TEXTURE0); gl.uniform1i(u.uTex, 0);
    function pass(from, to, mode, dx, dy) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, to.fb); gl.viewport(0, 0, to.w, to.h);
      gl.bindTexture(gl.TEXTURE_2D, from.tex || from); gl.uniform1f(u.uMode, mode); gl.uniform2f(u.uDir, dx, dy); gl.uniform1f(u.uThr, thr);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    pass(bl.src, bl.a, 0, 1 / bl.pw, 1 / bl.ph);
    pass(bl.a, bl.b, 1, 1.6 / bl.sw, 0); pass(bl.b, bl.a, 1, 0, 1.6 / bl.sh);
    pass(bl.a, bl.b, 1, 3.2 / bl.sw, 0); pass(bl.b, bl.a, 1, 0, 3.2 / bl.sh);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, bl.pw, bl.ph);
    var c = use('comp'); gl.uniform1i(c.uTex, 0); gl.bindTexture(gl.TEXTURE_2D, bl.a.tex); gl.uniform1f(c.uK, strength);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disable(gl.BLEND); gl.depthMask(true); gl.enable(gl.DEPTH_TEST);
  }

  return {
    background: background, bloom: bloom, setupPost: setupPost,
    init: init, resize: resize, frame: frame, project: project, srgb: srgb,
    push: push, pop: pop, tr: tr, rx: rx, ry: ry, rz: rz, top: top, scale: function (s) { S[S.length - 1] = mul(top(), SC(s)); },
    box: box, cyl: cyl, sphere: sphere, torus: torus, merge: merge, ribbon: ribbon, annulus: annulus,
    T: T, RX: RX, RY: RY, RZ: RZ,
    upload: upload, uploadFlat: uploadFlat, mesh: mesh, floor: floor, flat: flat, points: points, pointBuf: pointBuf, pointUpdate: pointUpdate,
    flipY: function () { S[S.length - 1] = mul(top(), [1,0,0,0, 0,-1,0,0, 0,0,1,0, 0,0,0,1]); }, refl: function (v) { REFL = v; },
    lost: function () { return gl.isContextLost(); }
  };
})();

/* ===== factory cell: six machine types wired to one SteelControl Edge ===== */
var Cell = (function () {
  var X = GLX, PI = Math.PI;
  var WH = X.srgb(0xe8e8e5), LG = X.srgb(0xb9b9b5), SV = X.srgb(0x8b8b88), GR = X.srgb(0x2b2b2d), BK = X.srgb(0x0d0d0e), GL = X.srgb(0x10151a), LED = X.srgb(0xffffff), OR = X.srgb(0xff7900);
  var EDARK = [0, 0, 0, 0.30], ELITE = [1, 1, 1, 0.20], EWH = [0.1, 0.1, 0.1, 0.45];
  var geo = {}, flats = [], pts = null, dust = null, ready = false;
  var nodes = [];   /* orange data nodes above each machine */

  function U(g) { return X.upload(g); }
  function B(w, h, d) { var k = 'b' + w + '_' + h + '_' + d; return geo[k] || (geo[k] = U(X.box(w, h, d))); }
  function C(rt, rb, h, n, e) { var k = 'c' + [rt, rb, h, n, e].join('_'); return geo[k] || (geo[k] = U(X.cyl(rt, rb, h, n || 32, e))); }
  function Tor(R, r, a, b) { var k = 't' + [R, r, a, b].join('_'); return geo[k] || (geo[k] = U(X.torus(R, r, a || 40, b || 10))); }
  function Sph(r, s, h) { var k = 's' + [r, s, h].join('_'); return geo[k] || (geo[k] = U(X.sphere(r, s || 24, h))); }

  /* part: box anchored at its bottom centre */
  function bx(w, h, d, x, y, z, col, edge, em) { X.push(); X.tr(x, y + h / 2, z); X.mesh(B(w, h, d), col, em || 0, edge); X.pop(); }
  function cy(rt, rb, h, x, y, z, col, edge, n, em) { X.push(); X.tr(x, y + h / 2, z); X.mesh(C(rt, rb, h, n || 32), col, em || 0, edge); X.pop(); }

  function build() {
    /* gear for the hub: ring + teeth */
    var parts = [[X.torus(1.0, 0.16, 48, 10), X.T(0, 0, 0)]], i;
    for (i = 0; i < 12; i++) { parts.push([X.box(0.36, 0.3, 0.42, true), mulRot(i / 12 * PI * 2)]); }
    geo.gear = U(X.merge(parts));
    /* data traces */
    var P = routes();
    P.forEach(function (r) { r.geo = X.uploadFlat(X.ribbon(r.pts, 0.16, 0.03)); r.glow = X.uploadFlat(X.ribbon(r.pts, 0.7, 0.025)); });
    flats = P;
    geo.ring = X.uploadFlat(X.annulus(0.975, 1.0, 96));
    geo.pad = null;
    /* dust */
    var arr = [], k; for (k = 0; k < 140; k++) arr.push((Math.random() - 0.5) * 30, Math.random() * 9, (Math.random() - 0.5) * 24, 0.4 + Math.random() * 0.9);
    dust = { arr: arr, pb: X.pointBuf(arr) };
    ready = true;
  }
  function mulRot(a) {
    /* tooth at radius 1.12 around Y */
    var R = X.RY(a), t = X.T(1.12, 0, 0);
    /* R * T */
    var o = new Array(16), i, j;
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) o[j * 4 + i] = R[i] * t[j * 4] + R[4 + i] * t[j * 4 + 1] + R[8 + i] * t[j * 4 + 2] + R[12 + i] * t[j * 4 + 3];
    return o;
  }

  /* machine anchors (x, z) and label heights */
  var LAYOUT = {
    robot:   { x: -5.5, z: -1.2, ry: 0.25, top: 5.0, name: 'Robô articulado' },
    cnc:     { x: 0.6,  z: -5.8, ry: 0,    top: 3.5, name: 'Fresadora CNC' },
    tank:    { x: 6.0,  z: -1.9, ry: 0,    top: 5.9, name: 'Tanque de processo' },
    printer: { x: 5.1,  z: 4.0,  ry: -0.3, top: 3.9, name: 'Impressora 3D' },
    belt:    { x: -2.2, z: 5.0,  ry: 0,    top: 2.5, name: 'Esteira' },
    plc:     { x: -5.6, z: -5.4, ry: 0.5,  top: 3.8, name: 'Painel de CLP' }
  };
  (function () { var K = 1.12, id; for (id in LAYOUT) { LAYOUT[id].x *= K; LAYOUT[id].z *= K; } })();
  function routes() {
    /* orthogonal "cable tray" routes from the hub to each machine; small lane offsets keep them apart */
    var L = LAYOUT, R = [];
    function r(id, pts, ph) { R.push({ id: id, pts: pts, ph: ph || 0 }); }
    r('robot',   [[-1.6, -0.35], [-3.4, -0.35], [-3.4, L.robot.z], [L.robot.x + 1.0, L.robot.z]], 0);
    r('cnc',     [[0.35, -1.6],  [0.35, L.cnc.z + 1.5]], 1.4);
    r('tank',    [[1.6, -0.5],  [4.0, -0.5], [4.0, L.tank.z], [L.tank.x - 1.35, L.tank.z]], 2.8);
    r('printer', [[1.4, 0.7],   [3.9, 0.7], [3.9, L.printer.z - 1.4], [4.2, L.printer.z - 1.4]], 4.2);
    r('belt',    [[-0.5, 1.6],  [-0.5, 3.4], [L.belt.x + 0.8, 3.4], [L.belt.x + 0.8, L.belt.z - 0.8]], 5.6);
    r('plc',     [[-1.2, -1.2], [-2.6, -1.2], [-2.6, L.plc.z], [L.plc.x + 1.0, L.plc.z]], 0.7);
    return R;
  }
  function anchor(id, dx, dy, dz) { var l = LAYOUT[id]; return [l.x + (dx || 0), (dy === undefined ? l.top : dy), l.z + (dz || 0)]; }

  /* ---------- machines ---------- */
  function robot(t) {
    var l = LAYOUT.robot; X.push(); X.tr(l.x, 0, l.z); X.ry(l.ry);
    /* pallet with parts */
    bx(2.2, 0.12, 1.5, 1.7, 0, 1.5, SV, EDARK); bx(0.6, 0.5, 0.6, 1.4, 0.12, 1.3, WH, EWH); bx(0.6, 0.5, 0.6, 2.1, 0.12, 1.7, WH, EWH);
    bx(1.9, 0.16, 1.9, 0, 0, 0, GR, ELITE);
    X.push(); X.ry(Math.sin(t * 0.5) * 0.9 - 0.2);
    cy(0.62, 0.7, 0.5, 0, 0.16, 0, WH, EWH, 40);
    X.tr(0, 0.9, 0); X.push(); X.rx(PI / 2); X.mesh(C(0.42, 0.42, 0.9, 32), GR, 0, ELITE); X.pop();
    X.rz(0.5 + Math.sin(t * 0.9) * 0.28);      /* shoulder */
    bx(0.55, 2.3, 0.5, 0, -0.1, 0, WH, EWH);
    X.tr(0, 2.2, 0); X.push(); X.rx(PI / 2); X.mesh(C(0.36, 0.36, 0.8, 32), GR, 0, ELITE); X.pop();
    X.rz(-1.25 + Math.sin(t * 0.9 + 1.0) * 0.32);   /* elbow */
    bx(0.42, 1.9, 0.4, 0, -0.1, 0, WH, EWH);
    X.tr(0, 1.8, 0); X.push(); X.rx(PI / 2); X.mesh(C(0.27, 0.27, 0.6, 24), GR, 0, ELITE); X.pop();
    X.rz(-0.6 + Math.sin(t * 0.9 + 2.0) * 0.3);   /* wrist */
    bx(0.3, 0.8, 0.3, 0, 0, 0, LG, EWH);
    cy(0.2, 0.2, 0.12, 0, 0.8, 0, GR, ELITE, 24);
    bx(0.08, 0.34, 0.2, -0.12, 0.9, 0, GR, ELITE); bx(0.08, 0.34, 0.2, 0.12, 0.9, 0, GR, ELITE);
    X.pop(); X.pop();
  }
  function cnc(t) {
    var l = LAYOUT.cnc; X.push(); X.tr(l.x, 0, l.z); X.ry(l.ry);
    bx(5.0, 0.8, 2.8, 0, 0, 0, GR, ELITE);
    bx(4.6, 0.12, 2.4, 0, 0.8, 0, LG, EWH);
    bx(1.6, 0.5, 1.2, 0.3, 0.92, 0.0, WH, EWH);          /* workpiece */
    bx(4.8, 0.3, 0.26, 0, 0.8, -1.25, WH, EWH); bx(4.8, 0.3, 0.26, 0, 0.8, 1.25, WH, EWH);   /* side rails */
    var gx = Math.sin(t * 0.55) * 1.5;
    X.push(); X.tr(gx, 0, 0);
    bx(0.4, 1.7, 0.4, 0, 0.8, -1.25, WH, EWH); bx(0.4, 1.7, 0.4, 0, 0.8, 1.25, WH, EWH);
    bx(0.5, 0.5, 3.1, 0, 2.2, 0, WH, EWH);
    var hz = Math.sin(t * 0.9) * 0.8;
    X.push(); X.tr(0, 0, hz);
    bx(0.8, 0.9, 0.7, 0, 1.55, 0, GR, ELITE);
    cy(0.16, 0.16, 0.55, 0, 1.0, 0, SV, EWH, 20); cy(0.05, 0.1, 0.4, 0, 0.6, 0, LG, EWH, 12);
    X.pop(); X.pop();
    /* signal tower */
    cy(0.05, 0.05, 1.0, 2.1, 0.92, 1.1, GR, null, 10);
    cy(0.14, 0.14, 0.16, 2.1, 1.92, 1.1, LED, null, 16, 0.9);
    cy(0.14, 0.14, 0.16, 2.1, 2.08, 1.1, LG, null, 16);
    X.pop();
  }
  function tank(t) {
    var l = LAYOUT.tank; X.push(); X.tr(l.x, 0, l.z);
    for (var i = 0; i < 4; i++) { var a = i * PI / 2 + PI / 4; cy(0.09, 0.09, 0.9, Math.cos(a) * 1.0, 0, Math.sin(a) * 1.0, GR, null, 10); }
    cy(1.35, 1.35, 3.0, 0, 0.9, 0, LG, EWH, 48);
    X.push(); X.tr(0, 3.9, 0); X.mesh(Sph(1.35, 28, true), LG, 0, null); X.pop();
    [1.5, 2.6, 3.7].forEach(function (y) { X.push(); X.tr(0, y, 0); X.mesh(Tor(1.36, 0.045, 48, 6), GR, 0, null); X.pop(); });
    cy(0.1, 0.1, 0.5, 0, 5.2, 0, GR, null, 10);
    /* level glass */
    bx(0.14, 2.0, 0.14, 1.38, 1.4, 0, GL, ELITE);
    var lv = 0.5 + 0.35 * Math.sin(t * 0.4); bx(0.08, 0.2 + 1.6 * lv, 0.08, 1.38, 1.4, 0.1, LED, null, 0.8);
    /* pipe and valve */
    X.push(); X.tr(-1.35, 1.2, 0); X.rz(PI / 2); X.mesh(C(0.1, 0.1, 1.4, 14), GR, 0, null); X.pop();
    cy(0.1, 0.1, 1.0, -2.05, 0.2, 0, GR, null, 14);
    X.push(); X.tr(-2.05, 0.9, 0); X.mesh(Tor(0.2, 0.035, 20, 6), WH, 0, null); X.pop();
    bx(0.7, 0.5, 0.6, -2.4, 0, 0.5, GR, ELITE);
    X.pop();
  }
  function printer(t) {
    var l = LAYOUT.printer; X.push(); X.tr(l.x, 0, l.z); X.ry(l.ry);
    bx(2.8, 0.45, 2.8, 0, 0, 0, GR, ELITE);
    [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].forEach(function (p) { bx(0.12, 2.6, 0.12, p[0], 0.45, p[1], WH, EWH); });
    bx(2.7, 0.1, 0.12, 0, 3.0, -1.3, WH, EWH); bx(2.7, 0.1, 0.12, 0, 3.0, 1.3, WH, EWH);
    bx(0.12, 0.1, 2.7, -1.3, 3.0, 0, WH, EWH); bx(0.12, 0.1, 2.7, 1.3, 3.0, 0, WH, EWH);
    var by = Math.sin(t * 0.7) * 0.25;
    bx(1.9, 0.1, 1.9, 0, 0.6, by, LG, EWH);
    var h = 0.15 + ((t * 0.12) % 1) * 0.9;
    bx(0.8, h, 0.8, 0, 0.7, by, WH, EWH);
    var hx = Math.sin(t * 1.7) * 0.5;
    bx(2.6, 0.1, 0.14, 0, 1.4 + 0.15 + h * 0.0, 0.0, GR, ELITE);
    X.push(); X.tr(hx, 0, by);
    bx(0.4, 0.34, 0.4, 0, 0.95 + h, 0, GR, ELITE); cy(0.0, 0.07, 0.16, 0, 0.8 + h, 0, LG, null, 10);
    X.pop();
    X.pop();
  }
  function belt(t) {
    var l = LAYOUT.belt; X.push(); X.tr(l.x, 0, l.z);
    var len = 6.0;
    bx(len, 0.3, 0.14, 0, 0.62, -0.78, WH, EWH); bx(len, 0.3, 0.14, 0, 0.62, 0.78, WH, EWH);
    bx(len, 0.1, 1.4, 0, 0.74, 0, GR, null);
    [-2.6, -0.9, 0.9, 2.6].forEach(function (x) { bx(0.12, 0.66, 0.12, x, 0, -0.78, GR, null); bx(0.12, 0.66, 0.12, x, 0, 0.78, GR, null); });
    var k;
    for (k = 0; k < 16; k++) { var sx = ((k * 0.5 + t * 0.9) % len) - len / 2; bx(0.05, 0.02, 1.3, sx, 0.84, 0, LG, null); }
    [-len / 2, len / 2].forEach(function (x) { X.push(); X.tr(x, 0.79, 0); X.rx(PI / 2); X.mesh(C(0.2, 0.2, 1.5, 20), SV, 0, EWH); X.pop(); });
    for (k = 0; k < 3; k++) { var cx = ((k * 2.0 + t * 0.9) % len) - len / 2; bx(0.75, 0.55, 0.75, cx, 0.84, 0, WH, EWH); }
    X.pop();
  }
  function plc(t) {
    var l = LAYOUT.plc; X.push(); X.tr(l.x, 0, l.z); X.ry(l.ry);
    bx(1.8, 2.9, 0.9, 0, 0, 0, WH, EWH);
    bx(1.5, 2.5, 0.05, 0, 0.2, 0.47, GR, ELITE);
    bx(0.7, 0.45, 0.04, -0.35, 2.0, 0.5, GL, null, 0.0); bx(0.6, 0.35, 0.02, -0.35, 2.05, 0.53, LED, null, 0.35);
    var r, c;
    for (r = 0; r < 6; r++) for (c = 0; c < 6; c++) {
      var on = Math.sin(t * (1.2 + (r * 7 + c * 3) % 5 * 0.4) + r * c) > 0.15;
      bx(0.12, 0.08, 0.03, -0.55 + c * 0.22, 0.4 + r * 0.22, 0.52, on ? LED : GL, null, on ? 0.9 : 0);
    }
    bx(1.2, 0.1, 0.5, 0, 2.9, 0, GR, ELITE);
    X.pop();
  }
  function hub(t) {
    X.push();
    cy(1.7, 1.9, 0.5, 0, 0, 0, BK, ELITE, 8);
    cy(1.2, 1.5, 0.22, 0, 0.5, 0, GR, ELITE, 8);
    cy(0.34, 0.5, 2.6, 0, 0.72, 0, GR, ELITE, 16);
    X.push(); X.tr(0, 1.4, 0); X.mesh(Tor(0.55, 0.045, 40, 6), OR, 0.95, null); X.pop();
    X.push(); X.tr(0, 3.5 + Math.sin(t * 0.8) * 0.08, 0); X.ry(t * 0.35); X.scale(0.9); X.mesh(geo.gear, WH, 0.0, EWH); X.pop();
    X.push(); X.tr(0, 3.5 + Math.sin(t * 0.8) * 0.08, 0); X.ry(-t * 0.5); X.mesh(Tor(0.52, 0.03, 36, 6), OR, 0.95, null); X.pop();
    X.pop();
  }

  var SH = [];
  function shadows() {
    var L = LAYOUT;
    return [[0, 0, 1.7, 1.7], [L.robot.x + 0.8, L.robot.z + 0.9, 2.2, 1.6], [L.cnc.x, L.cnc.z, 2.5, 1.4], [L.tank.x - 0.3, L.tank.z, 2.1, 1.5],
            [L.printer.x, L.printer.z, 1.4, 1.4], [L.belt.x, L.belt.z, 3.1, 0.8], [L.plc.x, L.plc.z, 0.9, 0.5]];
  }

  function machines(t) { robot(t); cnc(t); tank(t); printer(t); belt(t); plc(t); hub(t); }
  function draw(t) {
    if (!ready) build();
    X.refl(0.3); X.push(); X.flipY(); machines(t); X.pop(); X.refl(1);
    X.floor(shadows(), t);
    machines(t);
    var k;
    /* traces */
    for (k = 0; k < flats.length; k++) { X.push(); X.flat(flats[k].glow, X.srgb(0xff7900), 0.10, t, 0, 0, true); X.flat(flats[k].geo, X.srgb(0xff7900), 0.95, t, 1, flats[k].ph, true); X.pop(); }
    /* broadcast rings from the hub */
    for (k = 0; k < 3; k++) {
      var u = ((t * 0.18 + k / 3) % 1), r = 1.9 + u * 9.5;
      X.push(); X.tr(0, 0.04, 0); X.scale(r); X.flat(geo.ring, X.srgb(0xff7900), 0.55 * (1 - u) * Math.min(u * 6, 1), t, 0, 0, true); X.pop();
    }
    /* data nodes */
    var arr = [], id, a;
    for (id in LAYOUT) { a = anchor(id, 0, LAYOUT[id].top, 0); arr.push(a[0], a[1] + Math.sin(t * 1.5 + a[0]) * 0.06, a[2], 1); }
    arr.push(0, 4.9, 0, 1.6);
    if (!pts) pts = X.pointBuf(arr); else X.pointUpdate(pts, arr);
    X.points(pts.vao, arr.length / 4, X.srgb(0xff7900), 1.0, 0.9);
    X.points(pts.vao, arr.length / 4, X.srgb(0xffffff), 0.5, 0.28);
    /* dust */
    var d = dust.arr, i;
    for (i = 0; i < d.length; i += 4) d[i + 1] = (d[i + 1] + 0.003 + (i % 7) * 0.0006) % 9;
    X.pointUpdate(dust.pb, d);
    X.points(dust.pb.vao, d.length / 4, [0.8, 0.8, 0.8], 0.18, 0.09);
  }

  return { draw: draw, LAYOUT: LAYOUT, anchor: anchor };
})();

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* contact: fill CONTACT.email to turn the CTA into a real mailto */
  var CONTACT = { email: '' };
  (function () {
    var cta = document.getElementById('cta'), t = document.getElementById('addr');
    if (CONTACT.email && cta) {
      cta.href = 'mailto:' + CONTACT.email + '?subject=' + encodeURIComponent('Demonstração do SteelControl');
      cta.removeAttribute('target'); cta.textContent = 'Solicitar demonstração';
      if (t) t.textContent = CONTACT.email;
    }
  })();

  /* tabs */
  var tabs = [].slice.call(document.querySelectorAll('.tab')), cap = document.getElementById('cap');
  function show(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    cap.textContent = tab.getAttribute('data-cap');
  }
  tabs.forEach(function (t, i) {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener('click', function () { show(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!n) return;
      var nx = tabs[(i + n + tabs.length) % tabs.length]; nx.focus(); show(nx); e.preventDefault();
    });
  });

  var mt = [].slice.call(document.querySelectorAll('.mtab'));
  function mshow(t) { mt.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; document.getElementById(x.getAttribute('aria-controls')).hidden = !on; }); }
  mt.forEach(function (t, i) {
    t.tabIndex = i === 0 ? 0 : -1;
    t.addEventListener('click', function () { mshow(t); });
    t.addEventListener('keydown', function (e) { var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!n) return; var nx = mt[(i + n + mt.length) % mt.length]; nx.focus(); mshow(nx); e.preventDefault(); });
  });

  /* reveal */
  var rv = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduce || !window.IntersectionObserver) rv.forEach(function (e) { e.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (e) { io.observe(e); });
  }

  /* Lenis smooth scroll (guarded) */
  var lenis = null;
  if (!reduce && typeof window.Lenis === 'function') {
    try {
      lenis = new window.Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.5 });
      root.classList.add('lenis', 'lenis-smooth');
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a) return;
        var el = document.querySelector(a.getAttribute('href'));
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -70 }); }
      });
    } catch (e) { lenis = null; }
  }

  /* 3D scene */
  var canvas = document.getElementById('stage'), gl = null;
  try { gl = GLX.init(canvas); } catch (e) { gl = null; }
  function fallback() {
    root.classList.add('no-gl');
  }
  if (!gl) { fallback(); return; }

  var stops = [].slice.call(document.querySelectorAll('[data-stop]'));
  var KEY = {
    hero:   { sx: 0.46,  sy: -0.04, d: 1.0, a: 1 },
    left:   { sx: -0.46, sy: 0.02,  d: 1.34, a: 1 },
    right:  { sx: 0.46,  sy: 0.0,   d: 1.32, a: 1 },
    center: { sx: 0,     sy: 0.1,   d: 1.35, a: 0.55 }
  };
  var KEYM = {
    hero:   { sx: 0, sy: -0.5,  d: 0.78, a: 1 },
    left:   { sx: 0, sy: 0.62,  d: 1.25, a: 0.45 },
    right:  { sx: 0, sy: 0.62,  d: 1.25, a: 0.45 },
    center: { sx: 0, sy: 0.5,   d: 1.3, a: 0.4 }
  };
  var cur = { sx: 0, sy: 0, d: 1, a: 1 }, W = 1, H = 1, failed = false, enter = reduce ? 1 : 0;
  var mx = 0, my = 0, tx = 0, ty = 0, lastT = 0, first = true;
  window.addEventListener('pointermove', function (e) { tx = e.clientX / window.innerWidth - 0.5; ty = e.clientY / window.innerHeight - 0.5; }, { passive: true });
  function sm(t) { return t * t * (3 - 2 * t); }
  function target() {
    var wide = W >= 960, K = wide ? KEY : KEYM, y = window.scrollY + H * 0.5;
    var pts = [];
    stops.forEach(function (s) {
      var r = s.getBoundingClientRect(), top = r.top + window.scrollY, k = K[s.getAttribute('data-stop')];
      var a = top + Math.min(r.height / 2, H * 0.42), b = Math.max(a, top + r.height - H * 0.42);
      pts.push({ y: a, k: k }); if (b > a) pts.push({ y: b, k: k });
    });
    pts[0].y = Math.min(pts[0].y, H * 0.5);
    if (y <= pts[0].y) return pts[0].k;
    for (var i = 1; i < pts.length; i++) {
      if (y <= pts[i].y) {
        var a_ = pts[i - 1], b_ = pts[i], f = sm(Math.min(1, Math.max(0, (y - a_.y) / (b_.y - a_.y))));
        return { sx: a_.k.sx + (b_.k.sx - a_.k.sx) * f, sy: a_.k.sy + (b_.k.sy - a_.k.sy) * f, d: a_.k.d + (b_.k.d - a_.k.d) * f, a: a_.k.a + (b_.k.a - a_.k.a) * f };
      }
    }
    return pts[pts.length - 1].k;
  }
  function render(t) {
    if (failed || !W || !H) return;
    try {
      var dt = Math.min(0.1, Math.max(0, t - lastT)); lastT = t;
      var tg = target(), k = (first || window.__snap) ? 1 : Math.min(1, dt * 3.2);
      cur.sx += (tg.sx - cur.sx) * k; cur.sy += (tg.sy - cur.sy) * k; cur.d += (tg.d - cur.d) * k; cur.a += (tg.a - cur.a) * k; first = false;
      if (window.__snap) enter = 1; if (enter < 1) enter = Math.min(1, enter + dt / 2.4);
      var e = 1 - Math.pow(1 - enter, 3);
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      var wide = W >= 960, asp = W / H;
      var az = 0.55 + Math.sin(t * 0.1) * 0.1 + mx * 0.2 + (cur.sx) * 0.25, el = 0.74 + my * 0.05;
      var base = wide ? 35 * Math.max(1, 1.75 / asp) : 39 * Math.max(1, 0.9 / asp);
      var dist = base * cur.d;
      var eye = [dist * Math.sin(az) * Math.cos(el), dist * Math.sin(el) + 1.2, dist * Math.cos(az) * Math.cos(el)];
      GLX.frame(eye, [0, 1.2, 0], 0.5236, cur.sx, cur.sy - (1 - e) * 1.3);
      GLX.background(t, [0.027, 0.022, 0.018], [1.0, 0.38, 0.02], [1.0, 0.82, 0.62], 0.55 * e);
      Cell.draw(t);
      GLX.bloom(0.75 * e, 0.62);
      canvas.style.opacity = cur.a * (0.2 + 0.8 * e);
    } catch (err) { failed = true; fallback(); }
  }
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    GLX.resize(W, H, Math.min(window.devicePixelRatio || 1, window.innerWidth < 960 ? 1.5 : 2));
    if (reduce) render(3.0);
  }
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); failed = true; fallback(); });
  window.addEventListener('resize', resize);
  resize();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (reduce) render(3.0); });
  if (reduce) { window.addEventListener('scroll', function () { first = true; render(3.0); }, { passive: true }); return; }

  var t0 = performance.now();
  (function loop(now) {
    requestAnimationFrame(loop);
    if (lenis) lenis.raf(now);
    if (document.hidden) return;
    render((now - t0) / 1000 + 3.0);
  })(performance.now());
})();


(function () {
  var nav = document.getElementById('nav'), prog = document.getElementById('prog'), burger = document.getElementById('burger');
  var links = [].slice.call(document.querySelectorAll('.links a[href^="#"]'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    if (prog) prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if (nav) nav.classList.toggle('sc', y > 30);
    var cur = -1, mid = y + window.innerHeight * 0.35;
    secs.forEach(function (s, i) { if (s && s.offsetTop <= mid) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); onScroll();
  function close() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', window.SteelHomeI18n.menuLabel(false)); }
  burger.addEventListener('click', function () { var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o ? 'true' : 'false'); burger.setAttribute('aria-label', o ? window.SteelHomeI18n.menuLabel(true) : window.SteelHomeI18n.menuLabel(false)); });
  links.forEach(function (a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
})();
