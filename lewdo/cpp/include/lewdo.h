//
//  lewdo.h
//
//  Created by Lewey Geselowitz on 9/30/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef lewdo_h
#define lewdo_h

#include "size3_t.h"
#include "string3.h"
#include <list>

namespace lewdo {
    
    class string3_observable {
    public:
        typedef std::function<void(string3_observable*)> callback_t;
        
        string3_ptr buffer;
        std::list<callback_t> subscribers;
        size_t frame;
        
        string3_observable() {
            buffer = string3_ptr( size3_t::zero, nullptr );
            frame = 0;
        }
        
        void subscribe(callback_t _callback) {
            subscribers.push_back( _callback );
        }
        
        void subscribeCurrent(callback_t _callback) {
            subscribe( _callback );
            _callback( this );
        }
        
        void frameStep() {
            frame++;
            for (auto i=subscribers.begin(); i!=subscribers.end(); i++) {
                (*i)( this );
            }
        }
    };
    
    class lewdo_app {
    public:
        string3_observable app_in;
        string3_observable app_out;
        
        lewdo_app() {}
    };
}

#endif /* lewdo_h */
