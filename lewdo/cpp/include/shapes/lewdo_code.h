//
//  lewdo_code.h
//
//  Created by Lewey Geselowitz on 9/30/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef lewdo_code_h
#define lewdo_code_h

#include "lewdo_value.h"

#include <list>

namespace lewdo::shape {
    
    class lewdo_code_op {
    public:
        wchar_t operation;
        value_ref address;
        value_ref value;
        value_ref time;
        
        lewdo_code_op() {}
        lewdo_code_op(wchar_t _op, value_ref _address, value_ref _value, value_ref _time) {
            operation = _op;
            address = _address;
            value = _value;
            time = _time;
        }
    };
    
    class lewdo_op {
    public:
        static const wchar_t read = 'r';
        static const wchar_t write = 'w';
        static const wchar_t execute = 'x';
    };

    class lewdo_code {
    public:
        value_indexer addresses;
        value_indexer values;
        value_indexer times;
        std::list<lewdo_code_op> ops;
        size_t currentTime;
        
        
        bool increaseTimeOnOp = false;
        bool addressesInValues = false;
        
        string3_ptr ToString3() {
            size3_t size( values.size(), addresses.size(), times.size() );
            string3_ptr result = string3_ptr::New( size );
            result.Clear(' ');
            for (auto op=ops.begin(); op!=ops.end(); op++) {
                auto pos = size3_t( op->value.index, op->address.index, op->time.index );
                result.Set( pos, op->operation );
            }
            return result;
        }
        
        void addValue(value_ptr val) {
            values.ensure(val);
        }
        
        value_ref addAddress(value_ptr addr) {
            auto result = addresses.ensure( addr );
            if (addressesInValues) {
                addValue(addr);
            }
            return result;
        }
        
        void addTime() {
            currentTime++;
        }
        
        void addRead(void* ptr, value_ptr val) {
            auto address = value_ptr::voidPointer(ptr);
            addAddress(address);
            addOp(
                 lewdo_op::read,
                 addresses.ensure(address),
                 values.ensure(val),
                 times.ensure( value_ptr(&currentTime) ) );
        }
        
        template <typename T> void addHasRead(T& val) {
            addRead( &val, value_ptr(&val) );
        }
        
        void addWrite(void* ptr, value_ptr val) {
            auto address = value_ptr::voidPointer(ptr);
            addAddress(address);
            addOp(
                  lewdo_op::write,
                  addresses.ensure(address),
                  values.ensure(val),
                  times.ensure( value_ptr(&currentTime) ) );
        }
        
        lewdo_code_op addOpNow(wchar_t opCode, value_ref address, value_ref value) {
            return addOp( opCode, address, value, times.ensure( value_ptr(&currentTime) ) );
        }
        
        lewdo_code_op addOp(wchar_t opCode, value_ref address, value_ref value, value_ref time) {
            lewdo_code_op op( opCode, address, value, time );
            return addOp(op);
        }
        
        lewdo_code_op addOp(lewdo_code_op op) {
            ops.push_back(op);
            if (increaseTimeOnOp) {
                addTime();
            }
            return op;
        }
        
        void demo() {
            int test = 1;
            int* pTest = &test;
            
            addHasRead( test );
            addTime();
            addRead( &test, value_ptr(&test) );
            addWrite(&pTest, value_ptr(&pTest) );
            addTime();
            
        }
    };
    
}

#endif /* lewdo_code_h */
