﻿(function ()
{
    var _undefined = void 0

    rdint = function (array, offset)
    {
        return array[offset] << 24 | array[offset + 1] << 16 | array[offset + 2] << 8 | array[offset + 3]
    }

    xteaenc = function (y,z,K)
    {
        var sum = 0;
        var delta = 0x9E3779B9;
        var limit = delta * 32;
        try
        {
            while (sum != limit)
            {
                y += (z << 4 ^ z >>> 5) + z ^ sum + K[sum & 3],
                sum += delta;
                z += (y << 4 ^ y >>> 5) + y ^ sum + K[sum >>> 11 & 3];
            }
            return [y >>> 24, y >> 16 & 255, y >> 8 & 255, y & 255, z >>> 24, z >> 16 & 255, z >> 8 & 255, z & 255]
        }
        catch (error)
        {
            throw error;
        }
    }

    var f,
        g = this,
        k = void 0,
        p = Array.prototype,
        q = function (a, b, c)
        {
            return 2 >= arguments.length ? p.slice.call(a, b) : p.slice.call(a, b, c)
        },
        s = function (a, b, c, d, e)
        {
            c = a.split("."), d = g, c[0] in d || !d.execScript || d.execScript("var " + c[0]);
            for (; c.length && (e = c.shift()) ;) c.length || b === k ? d = d[e] ? d[e] : d[e] = {} : d[e] = b
        },
        t = function (a, b, c)
        {
            if (b = typeof a, "object" == b)
                if (a)
                {
                    if (a instanceof Array) return "array";
                    if (a instanceof Object) return b;
                    if (c = Object.prototype.toString.call(a), "[object Window]" == c) return "object";
                    if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
                    if ("[object Function]" == c || "undefined" != typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function"
                } else return "null";
            else if ("function" == b && "undefined" == typeof a.call) return "object";
            return b
        },
        u = (new function () { }, function (a, b)
        {
            a.o = ("E:" + b.message + ":" + b.stack).slice(0, 2048)
        }),
        w = function (a, b)
        {
            for (b = Array(a) ; a--;) b[a] = 255 * Math.random() | 0;
            return b
        },

        A = function (bguard, b)
        {
            bguard.L.push(bguard.memory.slice())
            bguard.memory[bguard.fetch_ptr] = _undefined
            wrmemory(bguard, bguard.fetch_ptr, b)
        }

        B = function (a, b, c)
        {
            return c = function ()
            {
                return a
            }, b = function ()
            {
                return c()
            }, b.V = function (b)
            {
                a = b
            }, b
        },
        D = function (a, b, c, d)
        {
            return function ()
            {
                if (!d || a.r) return wrmemory(a, a.N, arguments), wrmemory(a, a.m, c), C(a, b)
            }
        },
        E = function (a, b, c, d)
        {
            for (c = [], d = b - 1; 0 <= d; d--) c[b - 1 - d] = a >> 8 * d & 255;
            return c
        },
        F = function (a, b, c, d)
        {
            if (8192 > a.length) return String.fromCharCode.apply(null, a);
            for (b = "", c = 0; c < a.length; c += 8192) d = q(a, c, c + 8192), b += String.fromCharCode.apply(null, d);
            return b
        }
        
        C = function (bguard, b)
        {
            c = bguard.rdmemory(bguard.fetch_ptr)
            return bguard.bytecode && c < bguard.bytecode.length ? (wrmemory(bguard, bguard.fetch_ptr, bguard.bytecode.length), A(bguard, b)) : wrmemory(bguard, bguar.fetch_ptr, b), d = bguard.s(), wrmemory(bguard, bguar.fetch_ptr, c), d
        }

        H = function (bguard)
        {
            for (b = {}, b.O = bguard.rdmemory(fetch(bguard)), b.P = fetch(bguard), c = fetch(bguard) - 1, d = fetch(bguard), b.self = bguard.rdmemory(d), b.D = []; c--;) d = fetch(bguard), b.D.push(bguard.rdmemory(d));
            return b
        }

        wrmemory = function (bguard, address, c)
        {
            // if destination address can change pc/fetch pointers
            if (address == bguard.fetch_ptr || address == bguard.addr_instruction_address)
                bguard.memory[address] ? bguard.memory[address].V(c) : bguard.memory[address] = B(c);
            else if (address != bguard.d && address != bguard.g && address != bguard.h || !bguard.memory[address]) 
                bguard.memory[address] = J(c, bguard.rdmemory);

            // if destination address is teakey, drop seed and skip seed in bytecode
            if (address == bguard.addr_teakey)
            {
                bguard.xtea_seed = _undefined
                wrmemory(bguard, bguard.fetch_ptr, bguard.rdmemory(bguard.fetch_ptr) + 4)
            }
        }

        /// fetch data from instruction memory
        fetch = function (bguard)
        {
            fetch_ptr = bguard.rdmemory(bguard.fetch_ptr)

            // is fetch pointer inside bytecode range
            if (!(fetch_ptr in bguard.bytecode))
                throw bguard.f(bguard.Y), bguard.A;

            // if seed undefined, read seed from bytecode
            if (bguard.xtea_seed == _undefined)
            {
                bguard.xtea_seed    = rdint(bguard.bytecode, fetch_ptr - 4)
                bguard.xtea_blockid = _undefined
            }

            // update decrypted code
            if (bguard.xtea_blockid != fetch_ptr >> 3)
            {
                bguard.xtea_blockid = fetch_ptr >> 3
                key = [0, 0, 0, bguard.rdmemory(bguard.addr_teakey)]
                bguard.xtea_buff = xteaenc(bguard.xtea_seed, bguard.xtea_blockid, key)
            }

            wrmemory(bguard, bguard.fetch_ptr, fetch_ptr + 1)

            return bguard.bytecode[fetch_ptr] ^ bguard.xtea_buff[fetch_ptr % 8]
        }


        K = function (a, b, c, d, e)
        {
            for (a = a.replace(/\\r\\n/g, "\\n"), b = [], d = c = 0; d < a.length; d++) e = a.charCodeAt(d), 128 > e ? b[c++] = e : (2048 > e ? b[c++] = e >> 6 | 192 : (b[c++] = e >> 12 | 224, b[c++] = e >> 6 & 63 | 128), b[c++] = e & 63 | 128);
            return b
        }

        get_address_type = function (bguard, address)
        {
            if (address > bguard.addr_max)
                return [bguard.optype_byte, bguard.optype_short, bguard.optype_int, bguard.optype_array, bguard.optype_object, bguard.optype_string][address % bguard.optype_max]
            else if (address == bguard.h || address == bguard.d || address == bguard.g || address == bguard.H)
                return bguard.optype_array
            else if (address == bguard.N || address == bguard.I || address == bguard.J || address == bguard.m)
                return bguard.optype_object
            else if (address == bguard.v)
                return bguard.optype_string 
            else if (address == bguard.j || address == bguard.p || address == bguard.fetch_ptr || address == bguard.addr_instruction_address || address == bguard.t)
                return bguard.optype_short
            else if (address == bguard.n)
                return bguard.optype_byte
            else
                return bguard.optype_int
        }

        J = function (a, b, c, d, e, h, l, n, m)
        {
            return n = M, e = M.prototype, h = e.s, l = e.Q, m = e.f, d = function ()
            {
                return c()
            }, c = function (a, r, v)
            {
                for (v = 0, a = d[e.F], r = a === b, a = a && a[e.F]; a && a != h && a != l && a != n && a != m && 20 > v;) v++, a = a[e.F];
                return c[e.ga + r + !(!a + (v >> 2))]
            }, d[e.K] = e, c[e.fa] = a, a = k, d
        }

        N = function (bguard, b, c, d)
        {
            for (e = bguard.rdmemory(b), b = b == bguard.g ? function (b, c, d, h)
            {
                    if (c = e.length, d = c - 4 >> 3, e.da != d)
            {
                        e.da = d, d = (d << 3) - 4, h = [0, 0, 0, bguard.rdmemory(bguard.G)];
                        try
            {
                            e.ca = xteaenc(rdint(e, d), rdint(e, d + 4), h)
            } catch (r)
            {
                            throw r;
            }
            }
                    e.push(e.ca[c & 7] ^ b)
            } : function (a)
            {
                    e.push(a)
            }, d && b(d & 255), h = 0, d = c.length; h < d; h++) b(c[h])
        },
        M = function (a, b, c, d, e, h)
        {
            try
            {
                this.memory = []
                wrmemory(this, this.fetch_ptr, 0)
                wrmemory(this, this.addr_instruction_address, 0)
                wrmemory(this, this.addr_teakey, 0)
                wrmemory(this, this.h, [])
                wrmemory(this, this.d, [])
                wrmemory(this, this.I, "object" == typeof window ? window : g)
                wrmemory(this, this.J, this)
                wrmemory(this, this.n, 0)
                wrmemory(this, this.p, 0)
                wrmemory(this, this.G, 0)
                wrmemory(this, this.g, w(4))
                wrmemory(this, this.H, [])
                wrmemory(this, this.m, {})
                wrmemory(this, this.j, 2048)
                this.r = true
                if (a && "!" == a.charAt(0)) this.o = a;
                else
                {
                    if (window.atob)
                    {
                        for (c = window.atob(a), a = [], e = d = 0; e < c.length; e++)
                        {
                            for (h = c.charCodeAt(e) ; 255 < h;) a[d++] = h & 255, h >>= 8;
                            a[d++] = h
                        }
                        b = a
                    } else b = null;
                    (this.bytecode = b) && this.bytecode.length ? (this.L = [], this.s()) : this.f(this.U)
                }
            } catch (l)
            {
                u(this, l)
            }
        };

        f = M.prototype

        M.prototype.fetch_ptr   = 0
        M.prototype.addr_teakey = 1

        f.h = 2,
        f.addr_instruction_address = 3,
        f.d = 4,
        f.v = 5,
        f.N = 6,
        f.j = 7,
        f.t = 8,
        f.I = 9,
        f.J = 10,
        f.n = 11,
        f.p = 12,
        f.G = 13,
        f.g = 14,
        f.H = 15,
        f.m = 16,
            M.prototype.addr_max = 17,
        f.R = 15,
        f.ba = 12,
        f.S = 10,
        f.T = 42,

        M.prototype.optype_max    = 6;
        M.prototype.optype_string = -1
        M.prototype.optype_array  = -2
        M.prototype.optype_object = -3
        M.prototype.optype_byte   = 1
        M.prototype.optype_short  = 2
        M.prototype.optype_int    = 4


    f.U = 17,
    f.W = 21,
    f.B = 22,
    f.ea = 30,
    f.Y = 31,
    f.X = 33,
    f.A = {},
    f.F = "caller",
    f.K = "toString",
    f.ga = 34,
    f.fa = 36,

    // read memory from given address
    M.prototype.rdmemory = function (address)
    {
        value = this.memory[address]
        if (value === _undefined)
            throw this.f(this.ea, 0, a), this.A;
        return value()
    }

    M.prototype.ka = function (a, b, c, d)
    {
        try
        {
            d = a[(b + 2) % 3]
            a[b] = a[b] - a[(b + 1) % 3] - d ^ (b == 1 ? d << c : d >>> c)
        }
        catch (e)
        {
            throw e;
        }
    },
    M.prototype.ja = function (a, b, c, d)
    {
        if (3 == a.length)
        {
            for (c = 0; 3 > c; c++) b[c] += a[c];
            for (c = 0, d = [13, 8, 13, 12, 16, 5, 3, 10, 15]; 9 > c; c++) b[3](b, c % 3, d[c])
        }
    },
    M.prototype.la = function (a, b)
    {
        b.push(a[0] << 24 | a[1] << 16 | a[2] << 8 | a[3]), b.push(a[4] << 24 | a[5] << 16 | a[6] << 8 | a[7]), b.push(a[8] << 24 | a[9] << 16 | a[10] << 8 | a[11])
    },
    M.prototype.f = function (a, b, c)
    {
        d = this.rdmemory(this.addr_instruction_address)
        a = [a, d >> 8 & 255, d & 255]
        c != k && a.push(c)
        0 == this.rdmemory(this.h).length && (this.memory[this.h] = k, wrmemory(this, this.h, a))
        c = ""
        b && (b.message && (c += b.message), b.stack && (c += ":" + b.stack))
        b = this.rdmemory(this.j)
        3 < b && (c = c.slice(0, b - 3), b -= c.length + 3, c = K(c), N(this, this.g, E(c.length, 2).concat(c), this.ba))
        wrmemory(this, this.j, b)
    },
    f.M =
        [
            /// opcode 0x00
            /// nop
            function (bguard)
            {
            },
            /// opcode 0x01
            /// 
            function (bguard)
            {
                b = fetch(bguard)
                c = fetch(bguard)
                d = bguard.rdmemory(b)
                b = get_address_type(bguard, b)
                e = get_address_type(bguard, c), e == bguard.optype_string || e == bguard.optype_array ? d = "" + d : 0 < b && (1 == b ? d &= 255 : 2 == b ? d &= 65535 : 4 == b && (d &= 4294967295)), wrmemory(bguard, c, d)
            },
            /// opcode 0x02
            function (bguard)
            {
                if (b = fetch(bguard), c = get_address_type(bguard, b), 0 < c)
                {
                    for (d = 0; c--;) d = d << 8 | fetch(bguard);
                    wrmemory(bguard, b, d)
                }
                else if (c != bguard.optype_object)
                {
                    if (d = fetch(bguard) << 8 | fetch(bguard), c == bguard.optype_string)
                        if (c = "", bguard.memory[bguard.v] != k)
                            for (e = bguard.rdmemory(bguard.v) ; d--;) h = e[fetch(bguard) << 8 | fetch(bguard)], c += h;
                        else
                        {
                            for (c = Array(d), e = 0; e < d; e++) c[e] = fetch(bguard);
                            for (d = c, c = [], h = e = 0; e < d.length;) l = d[e++], 128 > l ? c[h++] = String.fromCharCode(l) : 191 < l && 224 > l ? (n = d[e++], c[h++] = String.fromCharCode((l & 31) << 6 | n & 63)) : (n = d[e++], m = d[e++], c[h++] = String.fromCharCode((l & 15) << 12 | (n & 63) << 6 | m & 63));
                            c = c.join("")
                        } else
                        for (c = Array(d), e = 0; e < d; e++) c[e] = fetch(bguard);
                    wrmemory(bguard, b, c)
                }
            },
            /// opcode 0x03
            function (bguard)
            {
                fetch(bguard)
            },
            /// opcode 0x04
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), c = bguard.rdmemory(c), b = bguard.rdmemory(b), wrmemory(bguard, d, b[c])
            },
            /// opcode 0x05
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), b = bguard.rdmemory(b), wrmemory(bguard, c, t(b))
            },
            /// opcode 0x06
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), d = get_address_type(bguard, b), e = get_address_type(bguard, c), c != bguard.h && (d == bguard.optype_string && e == bguard.optype_string ? (bguard.memory[c] == k && wrmemory(bguard, c, ""), wrmemory(bguard, c, bguard.rdmemory(c) + bguard.rdmemory(b))) : e == bguard.optype_array && (0 > d ? (b = bguard.rdmemory(b), d == bguard.optype_string && (b = K("" + b)), N(bguard, c, E(b.length, 2)), N(bguard, c, b)) : 0 < d && N(bguard, c, E(bguard.rdmemory(b), d))))
            },
            /// opcode 0x07
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), wrmemory(bguard, c, function (a)
                {
                    return eval(a)
                }(bguard.rdmemory(b)))
            },
            /// opcode 0x08
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), wrmemory(bguard, c, bguard.rdmemory(c) - bguard.rdmemory(b))
            },
            /// opcode 0x09
            function (bguard)
            {
                b = H(bguard), wrmemory(bguard, b.P, b.O.apply(b.self, b.D))
            },
            /// opcode 0x0A
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), wrmemory(bguard, c, bguard.rdmemory(c) % bguard.rdmemory(b))
            },
            /// opcode 0x0B
            function (bguard)
            {
                b = fetch(bguard), c = bguard.rdmemory(fetch(bguard)), d = bguard.rdmemory(fetch(bguard)), e = bguard.rdmemory(fetch(bguard)), bguard.rdmemory(b).addEventListener(c, D(bguard, d, e, true), false)
            },
            /// opcode 0x0C
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), bguard.rdmemory(b)[bguard.rdmemory(c)] = bguard.rdmemory(d)
            },
            /// opcode 0x0D
            function (bguard)
            {
            },
            /// opcode 0x0E
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), get_address_type(bguard, c) == bguard.optype_array ? N(bguard, c, get_address_type(bguard, b) == bguard.optype_string ? K("" + bguard.rdmemory(b)) : bguard.rdmemory(b)) : wrmemory(bguard, c, bguard.rdmemory(c) + bguard.rdmemory(b))
            },
            /// opcode 0x0F
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), 0 != bguard.rdmemory(b) && wrmemory(bguard, bguard.fetch_ptr, bguard.rdmemory(c))
            },
            /// opcode 0x10
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), bguard.rdmemory(b) == bguard.rdmemory(c) && wrmemory(bguard, d, bguard.rdmemory(d) + 1)
            },
            /// opcode 0x11
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), bguard.rdmemory(b) > bguard.rdmemory(c) && wrmemory(bguard, d, bguard.rdmemory(d) + 1)
            },
            /// opcode 0x12
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), wrmemory(bguard, d, bguard.rdmemory(b) << c)
            },
            /// opcode 0x13
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), wrmemory(bguard, d, bguard.rdmemory(b) | bguard.rdmemory(c))
            },
            /// opcode 0x14
            function (bguard)
            {
                b = bguard.rdmemory(fetch(bguard)), A(bguard, b)
            },
            /// opcode 0x15
            function (bguard)
            {
                if (b = bguard.L.pop())
                {
                    for (c = fetch(bguard) ; 0 < c; c--) d = fetch(bguard), b[d] = bguard.memory[d];
                    bguard.memory = b
                }
                else
                    wrmemory(bguard, bguard.fetch_ptr, bguard.bytecode.length)
            },
            /// opcode 0x16
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), wrmemory(bguard, d, (bguard.rdmemory(b) in bguard.rdmemory(c)) + 0)
            },
            /// opcode 0x17
            function (bguard)
            {
                b = fetch(bguard), c = bguard.rdmemory(fetch(bguard)), d = bguard.rdmemory(fetch(bguard)), wrmemory(bguard, b, D(bguard, c, d))
            },
            /// opcode 0x18
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), wrmemory(bguard, c, bguard.rdmemory(c) * bguard.rdmemory(b))
            },
            /// opcode 0x19
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), wrmemory(bguard, d, bguard.rdmemory(b) >> c)
            },
            /// opcode 0x1A
            function (bguard)
            {
                b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), wrmemory(bguard, d, bguard.rdmemory(b) || bguard.rdmemory(c))
            },
            /// opcode 0x1B
            function (bguard)
            {
                b = H(bguard), c = b.D, d = b.self, e = b.O;
                switch (c.length)
                {
                    case 0:
                        c = new d[e];
                        break;
                    case 1:
                        c = new d[e](c[0]);
                        break;
                    case 2:
                        c = new d[e](c[0], c[1]);
                        break;
                    case 3:
                        c = new d[e](c[0], c[1], c[2]);
                        break;
                    case 4:
                        c = new d[e](c[0], c[1], c[2], c[3]);
                        break;
                    default:
                        bguard.f(bguard.B);
                        return
                }
                wrmemory(bguard, b.P, c)
            },
            /// opcode 0x1C
            function (bguard)
            {
                if (b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), e = fetch(bguard), b = bguard.rdmemory(b), c = bguard.rdmemory(c), d = bguard.rdmemory(d), bguard = bguard.rdmemory(e), "object" == t(b))
                {
                    for (h in e = [], b)
                        e.push(h);
                    b = e
                }
                for (e = 0, h = b.length; e < h; e += d)
                    c(b.slice(e, e + d), bguard)
            }
        ],
    M.prototype.ia = function (a)
    {
        return (a = window.performance) && a.now ? function ()
        {
            return a.now() | 0
        } : function ()
        {
            return +new Date
        }
    }(),
    M.prototype.ha = function (a, b)
    {
        return b = this.Q(), a && a(b), b
    },
    M.prototype.s = function (a, b, c, d, e, h)
    {
        try
        {
            for (b = 5001, c = k, d = 0, a = this.bytecode.length; --b && (d = this.rdmemory(this.fetch_ptr)) < a;) try
                {
                wrmemory(this, this.addr_instruction_address, d), e = fetch(this) % this.M.length, (c = this.M[e]) ? c(this) : this.f(this.W, 0, e)
            } catch (l)
                {
                l != this.A && ((h = this.rdmemory(this.n)) ? (wrmemory(this, h, l), wrmemory(this, this.n, 0)) : this.f(this.B, l))
            }
            b || this.f(this.X)
        } catch (n)
        {
            try
            {
                this.f(this.B, n)
            } catch (m)
            {
                u(this, m)
            }
        }
        return this.rdmemory(this.m)
    },
    M.prototype.Q = function (a, b, c, d, e, h, l, n, m, z, r)
    {
        if (this.o) return this.o;
        try
        {
            if (this.r = false, b = this.rdmemory(this.d).length, c = this.rdmemory(this.g).length, d = this.rdmemory(this.j), this.memory[this.t] && C(this, this.rdmemory(this.t)), e = this.rdmemory(this.h), 0 < e.length && N(this, this.d, E(e.length, 2).concat(e), this.R), h = this.rdmemory(this.p) & 255, h -= this.rdmemory(this.d).length + 4, l = this.rdmemory(this.g), 4 < l.length && (h -= l.length + 3), 0 < h && N(this, this.d, E(h, 2).concat(w(h)), this.S), 4 < l.length && N(this, this.d, E(l.length, 2).concat(l), this.T), n = [3].concat(this.rdmemory(this.d)), window.btoa ? (z = window.btoa(F(n)), m = z = z.replace(/\\+/g, "-").replace(/\\/ / g, "_").replace(/=/g, "")) : m = k, m) m = "!" + m;
            else
                for (m = "", e = 0; e < n.length; e++) r = n[e][this.K](16), 1 == r.length && (r = "0" + r), m += r;
            this.rdmemory(this.d).length = b, this.rdmemory(this.g).length = c, wrmemory(this, this.j, d), a = m, this.r = true
        } catch (v)
        {
            u(this, v), a = this.o
        }
        return a
    };
    try
    {
        window.addEventListener("unload", function () { }, false)
    } catch (O) { }

    /// global mapping names change
    k = _undefined
    L = get_address_type
    G = fetch
    x = rdint
    I = xteaenc


    /// M prototypes
    M.prototype.a  = M.prototype.rdmemory
    M.prototype.b  = M.prototype.fetch_ptr
    M.prototype.c  = M.prototype.memory
    M.prototype.C  = M.prototype.xtea_blockid
    M.prototype.e  = M.prototype.bytecode
    M.prototype.i  = M.prototype.optype_string
    M.prototype.k  = M.prototype.addr_instruction_address
    M.prototype.l  = M.prototype.optype_array
    M.prototype.u  = M.prototype.optype_object
    M.prototype.w  = M.prototype.xtea_seed
    M.prorotype.y  = M.prototype.wrmemory
    M.prototype.Z  = M.prototype.xtea_buff
    M.prototype.aa = M.prototype.optype_max

    s("botguard.bg", M),
    s("botguard.bg.prototype.invoke", M.prototype.ha);

    bg = new M(encdata);
    bg.invoke(0, 0);

})
()


