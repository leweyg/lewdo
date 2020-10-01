//
//  lewdo_value.h
//
//  Created by Lewey Geselowitz on 9/30/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef lewdo_value_h
#define lewdo_value_h

#include <vector>

namespace lewdo::shape {
    
    class value_ptr {
    public:
        void*   pointer;
        size_t  size;
        
        value_ptr() {
            pointer = nullptr;
            size = 0;
        };
        value_ptr(void* _pointer, size_t _size) {
            pointer = _pointer;
            size = _size;
        };
        template <typename T> value_ptr(T* val) {
            pointer = (void*)val;
            size = sizeof(T);
        }
        
        bool IsNull() const { return (pointer==nullptr); }
        
        int8_t* byte_pointer() const { return (int8_t*)pointer; }
        
        template <typename T> static value_ptr fromPointer(T* pItem) {
            return value_ptr( (void*)pItem, sizeof(T) );
        }
        
        static value_ptr voidPointer(void*& item) {
            return value_ptr( (void*)&item, sizeof(void*) );
        }
        
        void Zero() {
            pointer = nullptr;
            size = 0;
        }
        
        void Free() {
            if (pointer) {
                free( pointer );
            }
        }
        
        value_ptr AllocateClone() const {
            void* mem = malloc( size );
            memcpy( mem, pointer, size);
            return value_ptr( mem, size );
        };
        
        int CompareTo(const value_ptr& other) const {
            if (size != other.size)
                return ((size < other.size) ? -1 : 1);
            int8_t* pHere = byte_pointer();
            int8_t* pOther = other.byte_pointer();
            for (auto i=0; i<size; i++) {
                auto a = pHere[i];
                auto b = pOther[i];
                if (a != b) return ((a < b) ? -1 : 1);
            }
            return 0;
        }
    };
    
    class value_index {
    public:
        size_t index;
    };
    
    class value_indexer;
    
    class value_ref : public value_index {
    public:
        value_indexer* indexer;
        
        value_ref() {}
        value_ref(size_t _index, value_indexer* _indexer) {
            index = _index;
            indexer = _indexer;
        }
        
        bool IsNull() const { return (indexer==nullptr); }
        
        value_ptr Value() const;
        
        static value_ref Null;
    };
    
    
    class value_indexer {
        std::vector<value_ptr> stores;
        
    public:
        
        value_indexer() {
        }
        
        ~value_indexer() {
            clear();
        }
        
        size_t size() const { return stores.size(); }
        
        value_ptr getByIndex(size_t index) const {
            return stores[index];
        }
        
        void clear() {
            for (auto i=stores.begin(); i!=stores.end(); i++) {
                i->Free();
            }
            stores.clear();
        }
        
        value_ref find(value_ptr val) {
            size_t index = 0;
            for (auto i=stores.begin(); i!=stores.end(); i++) {
                if (i->CompareTo(val) == 0)
                    return value_ref(index, this);
                index++;
            }
            return value_ref::Null;
        };
        
        value_ref ensure(value_ptr val) {
            value_ref existing = find(val);
            if (!existing.IsNull()) {
                return existing;
            }
            size_t index = stores.size();
            stores.push_back(val.AllocateClone());
            return value_ref(index, this);
        };
    
        
    };
    
    
    value_ref value_ref::Null = value_ref(0,nullptr);
    
    value_ptr value_ref::Value() const {
        return indexer->getByIndex( index );
    }
    
}



#endif /* lewdo_value_h */
