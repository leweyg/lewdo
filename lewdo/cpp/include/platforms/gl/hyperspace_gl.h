//
//  hyperspace_gl.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/9/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef hyperspace_gl_h
#define hyperspace_gl_h

#include "../../string3.h"
#include "../../shapes/hyperspace.h"

namespace lewdo_gl_hyperspace {
    
    using namespace lewdo;
    using namespace lewdo_shapes_hyperspace;
    
    class hypergl_context {
    public:
        
        void drawString3(string3_ptr str3) {
            auto model = string3_hypershape_ptr::allocate( str3 );
            auto vector = hypershaped_vector_ptr::allocate_standard( model.shape );
            auto vector_count = model.shape->vector_count_cached;
            
            //auto goal = hypershape_t::allocate_standard(6);
            
            for (auto i=0; i!=vector_count; i++) {
                model.data.vector_by_index_read( &vector, i );
                
            }
        }
        
    };
}

#endif /* hyperspace_gl_h */
