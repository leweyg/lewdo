//
//  string3_gl.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/5/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef string3_gl_h
#define string3_gl_h

#include "../../string3.h"
#include "../../math3_t.h"

#include <OpenGL/gl.h>


namespace lewdo {
    
    class string3_GLContext {
    private:
        int drawCallDepth = 0;
        
        void myBegin() {
            if (drawCallDepth!=0) {
                drawCallDepth++;
                return;
            }
            
            drawCallDepth = 1;
            glBegin(GL_TRIANGLES);
            glColor3f(0.5f,0.5f,0.5f);
        }
        
        void myEnd() {
            drawCallDepth--;
            assert( drawCallDepth >= 0 );
            if (drawCallDepth==0) {
                glEnd();
            }
        }
        
    public:
        string3_GLContext() {}
        

        
        void drawString(string3_ptr str3) {
            myBegin();
            // continue here
            auto size = str3.size;
            for (auto i=size.begin(); i!=size.end(); i++) {
                auto letter = str3.Get1D(i);
                auto pos = size.unpack(i);
                
                drawChar( letter, pos );
            }
            myEnd();
        }
        
        
        void drawChar(wchar_t letter, size3_t offset) {
            myBegin();
            
            float3_t v;
            
            static const int numVerts = 6;
            static const size3_t offsets[numVerts] = {
                size3_t(0.0f,0.0f,0.0f),
                size3_t(0.0f,1.0f,0.0f),
                size3_t(1.0f,0.0f,0.0f),
                size3_t(1.0f,1.0f,0.0f),
                size3_t(0.0f,1.0f,0.0f),
                size3_t(1.0f,0.0f,0.0f),
            };
            
            
            
            for (auto i=0; i<numVerts; i++) {
                auto c = offset.add(offsets[i]);
                auto p = LocalToWorld(c);
                glVertex3fv(p.data());
            }
            
            myEnd();
        }
        
        float3_t LocalToWorld(size3_t offset) {
            float3_t result;
            EXPAND3_i(result.v[i] = (0.1f * offset.v[i]));
            return result;
        }
        
        
    private:

        void drawQuad() {
            glBegin(GL_TRIANGLES);
            //float v[3] = { 0.5, 0.5, 0.5 };
            
            //glColor3fv(v);
            glColor3f(0.5f,0.5f,0.5f);
            
            glVertex3f(0.0f,0.0f,0.0f);
            glVertex3f(0.0f,1.0f,0.0f);
            glVertex3f(1.0f,0.0f,0.0f);
            
            glVertex3f(1.0f,1.0f,0.0f);
            glVertex3f(0.0f,1.0f,0.0f);
            glVertex3f(1.0f,0.0f,0.0f);
            
            glEnd();
        }
        
        
        
    };
    
}

#endif /* string3_gl_h */
