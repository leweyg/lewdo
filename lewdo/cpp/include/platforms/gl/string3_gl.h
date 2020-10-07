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
#include "../../shapes/font.h"

#include <OpenGL/gl.h>


namespace lewdo {
    
    class string3_GLContext {
    private:
        int drawCallDepth = 0;
        
        float3_t LocalToWorld(size3_t offset) {
            float3_t result;
            EXPAND3_i(result.v[i] = (0.02f * offset.v[i]));
            result.v[2] *= -4.0f;
            return result;
        }
        
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
            
            if (drawCallDepth>0) {
                return;
            }
            
            if (drawCallDepth==0) {
                glEnd();
            }
            assert( drawCallDepth >= 0 );
        }
        
    public:
        string3_GLContext() {}
        

        
        void drawString3(string3_ptr str3) {
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
        
        static bool isWhiteSpace(wchar_t letter) {
            switch (letter) {
                case 0:
                case ' ':
                case '\t':
                case '\n':
                case '\r':
                    return true;
                default:
                    return false;
            }
        }
        
        
        void drawChar(wchar_t letter, size3_t pos) {
            if (isWhiteSpace(letter)) return;
            
            float c = ((float)pos.v[2]) / 3.0f;
            glColor3f(c,c,c);
    
            drawCharBasicFont(letter,pos);
            //drawQuad(pos);
        }
        
        void drawCharBasicFont(wchar_t letter, size3_t pos) {
            auto pFont = &lewdo_font_tensor;
            auto fontSize2D = pFont->size;
            fontSize2D.v[2] = 1;
            auto fontStart = size3_t(0,0,letter);
            for (auto i=fontSize2D.begin(); i!=fontSize2D.end(); i++) {
                auto fontPos = fontSize2D.unpack(i);
                
                auto fontResult = pFont->Get(fontStart.add(fontPos));
                if (fontResult != 0) {
                    drawQuad( pos.multiply(fontSize2D).add(fontPos) );
                }
                
            }
        }
        
        void drawQuad(size3_t pos) {
            myBegin();
            
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
                auto c = pos.add(offsets[i]);
                auto p = LocalToWorld(c);
                glVertex3fv(p.data());
            }
            
            myEnd();
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
