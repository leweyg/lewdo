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
#include <OpenGL/gl.h>

namespace lewdo_gl_hyperspace {
    
    using namespace lewdo;
    using namespace lewdo_shapes_hyperspace;
    
    class hypergl_context {
    private:
        hypershape_t* unit_cube;
        bool isInited = false;
        
        const size3_t cube_corners[8] = {
            size3_t(0,0,0),
            size3_t(1,0,0),
            size3_t(0,1,0),
            size3_t(1,1,0),
            
            size3_t(0,0,1),
            size3_t(1,0,1),
            size3_t(0,1,1),
            size3_t(1,1,1),
        };
        
        const size_t cube_triangle_index_count = 3 * 2 * 6;
        const size_t cube_triangle_indices[ 3 * 2 * 6 ] = {
            // front
            0, 1, 2,
            2, 3, 0,
            // right
            1, 5, 6,
            6, 2, 1,
            // back
            7, 6, 5,
            5, 4, 7,
            // left
            4, 0, 3,
            3, 7, 4,
            // bottom
            4, 5, 1,
            1, 0, 4,
            // top
            3, 2, 6,
            6, 7, 3
        };
        
        void ensure_initialize() {
            if (isInited) return;
            isInited = true;
        }
        
    public:
        
        void drawString3(string3_ptr str3) {
            ensure_initialize();
            
            auto model = string3_hypershape_ptr::allocate( str3 );
            auto vector = hypershaped_vector_ptr::allocate_standard( model.shape );
            auto vector_count = model.shape->vector_count_cached;
            
            auto goal = hypershape_t::allocate_standard(6);
            goal->facets[0]->config_read( L"x", model.shape->findFacetByName( L"x" ) );
            goal->facets[1]->config_read( L"y", model.shape->findFacetByName( L"y" ) );
            goal->facets[2]->config_read( L"z", model.shape->findFacetByName( L"z" ) );
            goal->facets[3]->config_range( L"u", ranged_t(0.0,1.0) );
            goal->facets[4]->config_range( L"v", ranged_t(0.0,1.0) );
            goal->facets[5]->config_read( L"w", model.shape->findFacetByName( L"letter" ) );
            goal->update_cached();
            auto goalData = hypershaped_data_ptr::shaped_float_array( goal, nullptr, 0 );
            auto goalVector = hypermemory_t::standard().allocate_shaped_vector( goal );
            
            glBegin(GL_TRIANGLES);
            
            glColor4f(1.0f,1.0f,1.0f,1.0f);
            
            for (auto i=0; i!=vector_count; i++) {
                model.data.vector_by_index_read( &vector, i, nullptr );
                goalData.vector_by_index_read( &goalVector, i, &vector );
                
                auto ranges = goalVector.ranges;
                
                for (auto ti=0; ti<cube_triangle_index_count; ti++) {
                    auto si = cube_triangle_indices[ ti ];
                    auto corner = cube_corners[ si ];
                    
                    glTexCoord3d(ranges[3].seek(corner.v[0]),
                                 ranges[4].seek(corner.v[1]),
                                 ranges[5].seek(corner.v[2]));
                    
                    glVertex3f(ranges[0].seek(corner.v[0]),
                               ranges[1].seek(corner.v[1]),
                               ranges[2].seek(corner.v[2]));
                }
                
            }
            
            glEnd();
        }
        
    };
    
    hypergl_context hypergl_context_g;
}

#endif /* hyperspace_gl_h */