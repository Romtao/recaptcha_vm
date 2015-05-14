/* Anti-spam. Want to say hello? Contact (base64) Ym90Z3VhcmQtY29udGFjdEBnb29nbGUuY29tCg== */
(function ()
{
    var _undefined = void 0
    var self       = this

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

    function array_buffer_tostring(charArray)
    {
        if (charArray.length < 8192)
            return String.fromCharCode.apply(null, charArray);

        result = "";
        for (offset = 0; offset < charArray.length; offset += 8192)
        {
            tempCharArray = _sub_array(charArray, offset, offset + 8192);
            result += String.fromCharCode.apply(null, tempCharArray);
        }
        return result
    };

    get_typename = function (obj)
    {
        _typename = typeof obj
        if (_typename == "function" && typeof obj.call == "undefined")
            return "object";

        if (_typename != "object")
            return _typename

        if (!obj)
            return "null"

        if (obj instanceof Array) 
            return "array";

        if (obj instanceof Object) 
            return _typename;

        objname = Object.prototype.toString.call(obj);
        if (objname == "[object Window]") 
            return "object";

        if (objname == "[object Array]"  || 
            typeof obj.length == "number" && 
            typeof obj.splice != "undefined" && 
            typeof obj.propertyIsEnumerable != "undefined" && 
            !obj.propertyIsEnumerable("splice")) 
            return "array";

        if (objname == "[object Function]" || 
            typeof obj.call != "undefined" &&
            typeof obj.propertyIsEnumerable != "undefined" &&
            !obj.propertyIsEnumerable("call"))
            return "function"
    }

    /// push virtual machine state
    vm_switch = function (bguard, newptr)
    {
        bguard.vmstates.push(bguard.memory.slice())
        bguard.memory[bguard.fetch_ptr] = _undefined
        wrmemory(bguard, bguard.fetch_ptr, b)
    }

    function int2array(value, length)
    {
        result = []
        for (index = length - 1; index >= 0; index--) result[length - 1 - index] = (value >> (8 * index)) & 255;
        return result
    }

    gen_random_array = function (a, b)
    {
        array = Array(length)
        for (; length--;) array[length] = 255 * Math.random();
        return array
    }

    function sub_array(arrayObject, start, end)
    {
        return arguments.length <= 2 ? Array.prototype.slice.call(arrayObject, start) : Array.prototype.slice.call(arrayObject, start, end)
    }

    wrmemory = function (bguard, address, value)
    {
        // if destination address can change pc/fetch pointers
        if (address == bguard.fetch_ptr || address == bguard.addr_instruction_address)
            bguard.memory[address] ? bguard.memory[address].set(value) : bguard.memory[address] = create_value(value);
        else if (address != bguard.d && address != bguard.g && address != bguard.h || !bguard.memory[address])
            bguard.memory[address] = J(value, bguard.rdmemory);

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
            throw bguard.set_error(bguard.ERROR_31), bguard.A;

        // if seed undefined, read seed from bytecode
        if (bguard.xtea_seed == _undefined)
        {
            bguard.xtea_seed = rdint(bguard.bytecode, fetch_ptr - 4)
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

    create_value = function (value)
    {
        var get = function ()
        {
            return value
        }

        var fvalue = function ()
        {
            return get()
        }

        fvalue.set = function (nvalue)
        {
            value = nvalue
        }

        return fvalue
    }

    set_method = function (method_name, method)
    {
        parts = method_name.split(".")

        obj = self
        if (parts[0] in obj || !obj.execScript)
            obj.execScript("var " + parts[0]);

        for (; parts.length && (part = parts.shift()) ;)
        {
            if (parts.length || method === _undefined)
            {
                obj = obj[part] ? obj[part] : obj[part] = {}
            }
            else
            {
                obj[part] = method
            }
        }
    }

    set_error_string = (new function () { }, function (bguard, error)
    {
        bguard.error_message = ("E:" + error.message + ":" + error.stack).slice(0, 2048)
    })

    get_address_type = function (bguard, address)
    {
        if (address > bguard.addr_max)
            return [bguard.optype_byte, bguard.optype_short, bguard.optype_int, bguard.optype_array, bguard.optype_object, bguard.optype_string][address % bguard.optype_max]
        else if (address == bguard.h || address == bguard.d || address == bguard.g || address == bguard.H)
            return bguard.optype_array
        else if (address == bguard.addr_arguments || address == bguard.I || address == bguard.J || address == bguard.m)
            return bguard.optype_object
        else if (address == bguard.addr_unicode2ansi)
            return bguard.optype_string
        else if (address == bguard.j || address == bguard.p || address == bguard.fetch_ptr || address == bguard.addr_instruction_address || address == bguard.t)
            return bguard.optype_short
        else if (address == bguard.addr_exception)
            return bguard.optype_byte
        else
            return bguard.optype_int
    }

    parse_call_params = function (bguard)
    {
        op1 = G(proto)
        op2 = G(proto)
        op3 = G(proto)
        op4 = G(proto)

        call_params = {}
        call_params.operands = operands2string(op1, op2, op3)
        call_params.func     = proto.vm_read_memory(op1)
        call_params.result   = op2
        call_params.self     = proto.vm_read_memory(op4)
        call_params.args     = []
        for (narg = 0; narg < op3 - 1; narg++)
        {
            a_argument = fetch(proto)
            m_argument = proto.vm_read_memory(a_argument)
            call_params.args.push(m_argument);
        }
        return call_params
    }

    C = function (bguard, newptr)
    {
        fetch_ptr = bguard.rdmemory(bguard.fetch_ptr)
        if (bguard.bytecode && fetch_ptr < bguard.bytecode.length)
        {
            wrmemory(bguard, bguard.fetch_ptr, bguard.bytecode.length)
            vm_switch(bguard, newptr)
        }
        else
        {
            wrmemory(bguard, bguard.fetch_ptr, newptr)
            bguard.execute()
            wrmemory(bguard, bguard.fetch_ptr, fetch_ptr)
        }
    }

    create_callback = function (bguard, newptr, c, d)
    {
        return function ()
        {
            if (!d || bguard.canrun)
            {
                wrmemory(bguard, bguard.addr_arguments, arguments)
                wrmemory(bguard, bguard.m, c)
                return C(bguard, newptr)
            }
        }
    }
        

        K = function (a, b, c, d, e)
        {
            for (a = a.replace(/\\r\\n/g, "\\n"), b = [], d = c = 0; d < a.length; d++) e = a.charCodeAt(d), 128 > e ? b[c++] = e : (2048 > e ? b[c++] = e >> 6 | 192 : (b[c++] = e >> 12 | 224, b[c++] = e >> 6 & 63 | 128), b[c++] = e & 63 | 128);
            return b
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
            }, d[e.K] = e, c[e.fa] = a, a = _undefined, d
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
                wrmemory(this, this.I, "object" == typeof window ? window : self)
                wrmemory(this, this.J, this)
                wrmemory(this, this.addr_exception, 0)
                wrmemory(this, this.p, 0)
                wrmemory(this, this.G, 0)
                wrmemory(this, this.g, gen_random_array(4))
                wrmemory(this, this.H, [])
                wrmemory(this, this.m, {})
                wrmemory(this, this.j, 2048)
                this.canrun = true
                if (a && "!" == a.charAt(0)) this.error_message = a;
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
                    (this.bytecode = b) && this.bytecode.length ? (this.vmstates = [], this.execute()) : this.set_error(this.ERROR_17)
                }
            } catch (l)
            {
                set_error_string(this, l)
            }
        };

        var f = M.prototype

        M.prototype.fetch_ptr   = 0
        M.prototype.addr_teakey = 1

        f.h = 2,
        f.addr_instruction_address = 3,
        f.d = 4,
        f.addr_unicode2ansi = 5,
        f.addr_arguments    = 6,
        f.j = 7,
        f.t = 8,
        f.I = 9,
        f.J = 10,
        f.addr_exception = 11,
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
        M.prototype.ERROR_17 = 17
        M.prototype.ERROR_21 = 21
        M.prototype.ERROR_22 = 22
        M.prototype.ERROR_30 = 30
        M.prototype.ERROR_31 = 31
        M.prototype.ERROR_TOO_MUCH_INSTRUCTIONS = 33

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
            throw this.set_error(this.ERROR_30, 0, address), this.A;
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

    M.prototype.set_error = function (error_code, throw_info, additional_info)
    {
        instruction_address = this.rdmemory(this.addr_instruction_address)
        error_info = [error_code, instruction_address >> 8 & 255, instruction_address & 255]
        if (additional_info != _undefined)
            error_info.push(additional_info)

        if (this.rdmemory(this.h).length == 0)
        {
            this.memory[this.h] = _undefined
            wrmemory(this,this.h,error_info)
        }

        message = ""
        if (throw_info)
        {
            if (throw_info.message)
                message += throw_info.message;
            if (throw_info.stack)
            {
                message += ":"
                message += throw_info.message;
            }
        }
        b = this.rdmemory(this.j)
        c = message

        if (b > 3)
        {
            c = c.slice(0, b - 3),
            b -= c.length + 3,
            c = K(c),
            N(this, this.g, int2array(c.length, 2).concat(c), this.ba)
        }
        
        wrmemory(this, this.j, b)
    },
    M.prototype.opcode_table =
        [
            /// opcode 0x00
            /// nop
            function (bguard)
            {
            },
            /// ***********************************************
            /// opcode 0x01
            /// mov op2,op1
            /// [op2] = [op1]
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                src = bguard.rdmemory(op1)

                op1type = get_address_type(bguard, op1)
                op2type = get_address_type(bguard, op2)

                // string/array
                if (op2type == bguard.optype_string || op2type == bguard.optype_array) 
                {
                    src = "" + src
                }
                // numeric types
                else if (op1type > 0)
                {
                    if (op1type == bguard.optype_byte)
                        src &= 0xFF
                    else if (op1type == bguard.optype_short)
                        src &= 0xFFFF
                    else if (op1type == bguard.optype_int)
                        src &= 0xFFFFFFFF
                }
                // object type
                wrmemory(bguard,op2,src)
            },
            /// ***********************************************
            /// opcode 0x02
            /// movi dst,imm
            /// [dst] = immediate value
            /// ***********************************************
            function (bguard)
            {
                dst     = fetch(bguard)
                dsttype = get_address_type(bguard, dst)
                if (dsttype > 0)
                {
                    ivalue   = 0
                    numbytes = dsttype;
                    for (; numbytes--;)
                        ivalue = ivalue << 8 | fetch(bguard);
                    wrmemory(bguard, dst, d)
                }
                else if (dsttype != bguard.optype_object)
                {
                    immlen = fetch(bguard) << 8 | fetch(bguard)
                    // string
                    if (dsttype == bguard.optype_string)
                    {
                        result = ""
                        if (bguard.memory[bguard.addr_unicode2ansi] != _undefined)
                        {
                            recoding = bguard.rdmemory(bguard.addr_unicode2ansi)
                            for (; immlen--;)
                                result += recoding[fetch(bguard) << 8 | fetch(bguard)]
                            wrmemory(bguard, dst, result)
                        }
                        else
                        {
                            string = Array(immlen)
                            for (nelement = 0; nelement < immlen; nelement++)
                                string[nelement] = fetch(bguard);

                            result = []
                            src    = string
                            srcrd  = 0
                            for (nelement = 0; nelement < src.length;)
                            {
                                ch = src[nelement++]
                                if (l < 128)
                                {
                                    result[srcrd++] = String.fromCharCode(ch)
                                }
                                else if (l >= 192 && l < 224)
                                {
                                    result[srcrd++] = String.fromCharCode((ch & 31) << 6 | src[nelement++] & 63)
                                }
                                else
                                {
                                    result[srcrd++] = String.fromCharCode((ch & 15) << 12 | (src[nelement++] & 63) << 6 | src[nelement++] & 63)
                                }
                            }
                            result = result.join("")
                            wrmemory(bguard, dst, result)
                        }
                    }
                    // array
                    else
                    {
                        result = Array(immlen)
                        for (nelement = 0; nelement < immlen; nelement++)
                            result[nelement] = fetch(bguard);
                        wrmemory(bguard, dst, result)
                    }
                }
            },
            /// ***********************************************
            /// opcode 0x03
            /// skip
            /// skip one byte from bytecode
            /// ***********************************************
            function (bguard)
            {
                fetch(bguard)
            },
            /// ***********************************************
            /// opcode 0x04
            /// rdprop obj,ptr,dst
            /// [dst] = obj[ptr] (for example q = document["script"]
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                op3 = fetch(bguard)

                ptr = bguard.rdmemory(op2)
                obj = bguard.rdmemory(op1)

                wrmemory(bguard, op3, obj[ptr])
            },
            /// ***********************************************
            /// opcode 0x05
            /// typename op1,op2
            /// [op2] = typeof op1
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)

                obj = bguard.rdmemory(op1)

                wrmemory(bguard, op2, get_typename(obj))
            },
            /// ***********************************************
            /// opcode 0x06
            /// concat op1,op2
            /// [op1] = [op2] join [op1]
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)

                op1type = get_address_type(bguard, op1)
                op2type = get_address_type(bguard, op2)
                
                if (op2 != bguard.h)
                {
                    if (op1type == bguard.optype_string && op2type== bguard.optype_string)
                    {
                        if (bguard.memory[op2] == _undefined)
                            wrmemory(bguard,op2,"")
                        wrmemory(bguard, op2, bguard.rdmemory(op2) + bguard.rdmemory(op1))
                    }
                    else if (op2type == bguard.optype_array)
                    {
                        if (optype > 0)
                        {
                            N(bguard, op2, int2array(bguard.rdmemory(op1), op1type))
                        }
                        else if (optype < 0)
                        {
                            src = bguard.rdmemory(op1)
                            if (op1type == bguard.optype_string)
                                src = K("" + src)
                            N(bguard, op2, int2array(src.length, 2)),
                            N(bguard, op2, src)
                        }
                    }
                }
            },
            /// ***********************************************
            /// opcode 0x07
            /// eval op1, op2
            /// [op2] = eval([op1])
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                wrmemory(bguard, op2, function (param) { return eval(param) } (bguard.rdmemory(op1)))
            },
            /// ***********************************************
            /// opcode 0x08
            /// sub op1,op2
            /// [op2] = [op2] - [op1]
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                wrmemory(bguard, op2, bguard.rdmemory(op2) - bguard.rdmemory(op1))
            },
            /// ***********************************************
            /// opcode 0x09
            /// call op1,op2,op3,..... (func,result,numargs,...)
            /// ***********************************************
            function (bguard)
            {
                call_params = parse_call_params(bguard)
                wrmemory(bguard, call_params.result, call_params.func.apply(call_params.self, call_params.args))
            },
            /// ***********************************************
            /// opcode 0x0A
            /// mod op1,op2
            /// [op2] = [op2] % [op1]
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                wrmemory(bguard, op2, bguard.rdmemory(op2) % bguard.rdmemory(opq))
            },
            /// ***********************************************
            /// opcode 0x0B
            /// addevent op1,op2,op3,op4
            /// op1.addEventListener(op2,(newptr,arg0),false)
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                op3 = fetch(bguard)
                op4 = fetch(bguard)

                obj = bguard.rdmemory(op1)
                ev  = bguard.rdmemory(op2)

                newptr = bguard.rdmemory(op3)
                arg0   = bguard.rdmemory(op4)
                obj.addEventListener(ev, create_callback(bguard, newptr, arg0, true), false)
            },
            /// ***********************************************
            /// opcode 0x0C
            /// aset op1,op2,op3
            /// [op1][op2] = [op3]
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                op3 = fetch(bguard)

                arr = bguard.rdmemory(op1)
                idx = bguard.rdmemory(op2)
                val = bguard.rdmemory(op3)

                arr[idx] = val
            },
            /// ***********************************************
            /// opcode 0x0D
            /// nop1
            /// ***********************************************
            function (bguard)
            {
            },
            /// ***********************************************
            /// opcode 0x0E
            /// add op1,op2
            /// [op2] = [op2] + [op1]
            /// ***********************************************
            function (bguard)
            {
                op1     = fetch(bguard)
                op2     = fetch(bguard)
                op2type = get_address_type(bguard, op2)
                if (op2type != bguard.optype_array)
                {
                    wrmemory(bguard, op2, bguard.rdmemory(op2) + bguard.rdmemory(op1))
                }
                else
                {
                    op1type = get_address_type(bguard, op2)
                    value   = op1type == bguard.optype_string ? K("" + bguard.rdmemory(op1)) : bguard.rdmemory(op1)
                    N(bguard,op2,value)
                }
            },
            /// ***********************************************
            /// opcode 0x0F
            /// bnz op1,op2
            /// if (op1 != 0) jump op2
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                if (bguard.rdmemory(op1) != 0)
                    wrmemory(bguard, bguard.fetch_ptr, bguard.rdmemory(op2))
            },
            /// ***********************************************
            /// opcode 0x10
            /// inceq op1,op2,op3
            /// if (op1 == op2) [op3+]
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                op3 = fetch(bguard)
                if (bguard.rdmemory(op1) == bguard.rdmemory(op2))
                    wrmemory(bguard, op3, bguard.rdmemory(op3) + 1)
            },
            /// ***********************************************
            /// opcode 0x11
            /// incgt op1,op2,op3
            /// if (op1 > op2) [op3++]
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                op3 = fetch(bguard)
                if (bguard.rdmemory(op1) > bguard.rdmemory(op2))
                    wrmemory(bguard, op3, bguard.rdmemory(op3) + 1)
            },
            /// ***********************************************
            /// opcode 0x12
            /// shl op1,op2,op3
            /// [op3] = [op1] << op2
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                op3 = fetch(bguard)
                wrmemory(bguard, op3, bguard.rdmemory(op1) << op2)
            },
            /// ***********************************************
            /// opcode 0x13
            /// or op1,op2,op3
            /// [op3] = [op1] | [op2]
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                op3 = fetch(bguard)
                wrmemory(bguard, op3, bguard.rdmemory(op1) | bguard.rdmemory(op2))
            },
            /// ***********************************************
            /// opcode 0x14
            /// vmswitch1 op1
            /// store current memory in stack and set new pc
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                newptr = bguard.rdmemory(op1)
                vm_switch(bguard, newptr)
            },
            /// ***********************************************
            /// opcode 0x15
            /// vmswitch2 op1
            /// restore and read memory from bytecode stream
            /// ***********************************************
            function (bguard)
            {
                memorystate = bguard.vmstates.pop()
                if (prev_memory)
                {
                    numbytes = fetch(bguard)
                    for (; numbytes > 0 ; numbytes--)
                    {
                        data = fetch(bguard)
                        memorystate[d] = bguard.memory[data];
                    }
                    bguard.memory = memorystate
                }
                else
                {
                    // set to code end
                    wrmemory(bguard, bguard.fetch_ptr, bguard.bytecode.length)
                }
            },
            /// ***********************************************
            /// opcode 0x16
            /// isin op1,op2,op3
            /// [op3] = [op1] in [op2]
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                op3 = fetch(bguard)
                wrmemory(bguard, op3, (bguard.rdmemory(op1) in bguard.rdmemory(op2)) + 0)
            },
            /// ***********************************************
            /// opcode 0x17
            /// ***********************************************
            function (bguard)
            {
                op1 = fetch(bguard)
                op2 = fetch(bguard)
                op3 = fetch(bguard)

                newptr = bguard.rdmemory(op2)
                arg2   = bguard.rdmemory(op3)
                wrmemory(bguard, op1, create_callback(bguard, newptr, arg2))
            },
            /// ***********************************************
            /// opcode 0x18
            /// ***********************************************
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
                call_params = parse_call_params(bguard),
                args  = call_params.args
                fthis = call_params.self
                func  = call_params.func
                switch (args.length)
                {
                    case 0:
                        c = new fthis[func];
                        break;
                    case 1:
                        c = new fthis[func](args[0]);
                        break;
                    case 2:
                        c = new fthis[func](args[0], args[1]);
                        break;
                    case 3:
                        c = new fthis[func](args[0], args[1], args[2]);
                        break;
                    case 4:
                        c = new fthis[func](args[0], args[1], args[2], args[3]);
                        break;
                    default:
                        bguard.set_error(bguard.ERROR_22);
                        return
                }
                wrmemory(bguard, call_params.result, args)
            },
            /// opcode 0x1C
            function (bguard)
            {
                if (b = fetch(bguard), c = fetch(bguard), d = fetch(bguard), e = fetch(bguard), b = bguard.rdmemory(b), c = bguard.rdmemory(c), d = bguard.rdmemory(d), bguard = bguard.rdmemory(e), "object" == get_typename(b))
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
    }

    M.prototype.execute = function ()
    {
        try
        {
            opcode_func      = _undefined
            max_instructions = 5000
            instruction_ptr = 0
            bytecode_length = this.bytecode.length
            for (; --max_instructions && (instruction_ptr = this.rdmemory(this.fetch_ptr)) < bytecode_length;)
            {
                try
                {
                    wrmemory(this, this.addr_instruction_address, instruction_ptr)
                    opcode = fetch(this) % this.opcode_table.length
                    opcode_func = this.opcode_table[opcode]
                    if (opcode_func)
                        opcode_func(this)
                    else
                        this.set_error(this.ERROR_21, 0, opcode)
                }
                catch (exception)
                {
                    if (exception != this.A)
                    {
                        addr_exception = this.rdmemory(this.addr_exception)
                        if (addr_exception)
                        {
                            wrmemory(this, addr_exception, exception)
                            wrmemory(this, this.addr_exception, 0)
                        }
                        else
                        {
                            this.set_error(this.ERROR_22, exception)
                        }
                    }
                }
            }
            // too much instruction
            if (max_instructions == 0)
                this.set_error(this.ERROR_TOO_MUCH_INSTRUCTIONS)
        }
        catch (n)
        {
            try
            {
                this.set_error(this.ERROR_22, n)
            }
            catch (m)
            {
                set_error_string(this, m)
            }
        }
        return this.rdmemory(this.m)
    },

    M.prototype.Q = function (a, b, c, d, e, h, l, n, m, z, r)
    {
        if (this.error_message) return this.error_message;
        try
        {
            this.canrun = false
            b = this.rdmemory(this.d).length
            c = this.rdmemory(this.g).length
            d = this.rdmemory(this.j)
            this.memory[this.t]
            C(this, this.rdmemory(this.t))
            e = this.rdmemory(this.h)
            0 < e.length && N(this, this.d, int2array(e.length, 2).concat(e), this.R)
            h = this.rdmemory(this.p) & 255
            h -= this.rdmemory(this.d).length + 4
            l = this.rdmemory(this.g)
            4 < l.length && (h -= l.length + 3)
            0 < h && N(this, this.d, int2array(h, 2).concat(gen_random_array(h)), this.S)
            4 < l.length && N(this, this.d, int2array(l.length, 2).concat(l), this.T)
            n = [3].concat(this.rdmemory(this.d))
            if (window.btoa ? (z = window.btoa(array_buffer_tostring(n)), m = z = z.replace(/\\+/g, "-").replace(/\\/ / g, "_").replace(/=/g, "")) : m = _undefined, m) m = "!" + m;
            else
                for (m = "", e = 0; e < n.length; e++) r = n[e][this.K](16), 1 == r.length && (r = "0" + r), m += r;
            this.rdmemory(this.d).length = b, this.rdmemory(this.g).length = c, wrmemory(this, this.j, d), a = m, this.canrun = true
        } catch (v)
        {
            set_error_string(this, v),
            a = this.error_message
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
    t = get_typename
    E = int2array
    w = gen_random_array
    q = sub_array
    g = self
    s = set_method


    /// M prototypes
    M.prototype.a  = M.prototype.rdmemory
    M.prototype.b  = M.prototype.fetch_ptr
    M.prototype.c  = M.prototype.memory
    M.prototype.C  = M.prototype.xtea_blockid
    M.prototype.e  = M.prototype.bytecode
    M.prototype.i  = M.prototype.optype_string
    M.prototype.k  = M.prototype.addr_instruction_address
    M.prototype.l  = M.prototype.optype_array
    M.prototype.L  = M.prototype.vmstates
    M.prototype.M  = M.prototype.opcode_table
    M.prototype.o  = M.prototype.error_message
    M.prototype.s  = M.prototype.execute
    M.prototype.u  = M.prototype.optype_object
    M.prototype.v  = M.prototype.addr_unicode2ansi
    M.prototype.w  = M.prototype.xtea_seed
    M.prorotype.y  = M.prototype.wrmemory
    M.prototype.Z  = M.prototype.xtea_buff
    M.prototype.aa = M.prototype.optype_max


    set_method("botguard.bg", M),
    set_method("botguard.bg.prototype.invoke", M.prototype.ha);

    bg = new M(encdata);
    bg.invoke(0, 0);

})
()


