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

namespace lewdo {
    
    class lewdo_app {
    public:
        string3_observable app_in;
        string3_observable app_out;
        
        lewdo_app() {}
    };
}

#endif /* lewdo_h */
