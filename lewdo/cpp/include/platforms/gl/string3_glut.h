//
//  string3_glut.h
//  lewdo_native
//
//  Created by Lewey Geselowitz on 10/5/20.
//  Copyright © 2020 Lewey Geselowitz. All rights reserved.
//

#ifndef string3_glut_h
#define string3_glut_h

#define GL_SILENCE_DEPRECATION 1
#include "string3_gl.h"
#include <GLUT/glut.h>

const GLfloat EDGE = 50.0;
const GLfloat SQR3 = sqrt(3);
const GLfloat SQR6 = sqrt(6);

namespace lewdo {
    
    class lewdo_glut;
    
    class lewdo_glut {
    public:
        static lewdo_glut* global_instance();
        
        static int main(lewdo_app* pRootApp, int argc, char** argv) {
            global_instance()->pApp = pRootApp;
            return global_instance()->main_private( argc, argv );
        }
        
    private:
        int frameCount = 0;
        lewdo_app* pApp;
        string3_GLContext context;
        
        
        void gl_initialize() {
            glEnable(GL_DEPTH_TEST);
            glShadeModel(GL_SMOOTH);
            glColor3f(0.0, 1.0, 0.0);
        }
        
        int main_private(int argc, char** argv) {
            glutInit(&argc, argv);
            
            glutInitDisplayMode(GLUT_RGB | GLUT_SINGLE | GLUT_DEPTH);
            
            glutInitWindowSize(500, 500*SQR3/2);
            glutInitWindowPosition(0, 0);
            glutCreateWindow("lewdo");
            
            gl_initialize();
            
            glutKeyboardFunc(myKeyboardCallback);
            glutSpecialFunc(mySpecialKeyFunction);
            glutMouseFunc(myMouseFunc);
            glutMotionFunc(myMouseMove);
            glutPassiveMotionFunc(myMouseMove);
            
            glutDisplayFunc(display);
            
            glutWMCloseFunc([]() {
                exit(0);
            });
            
            
            glutMainLoop();
            return 0;
            
        }
        
        static void frame_pre() {
            int w = glutGet(GLUT_WINDOW_WIDTH);
            int h = glutGet(GLUT_WINDOW_HEIGHT);
            
            glViewport(0, 0, w, h);
            glMatrixMode(GL_PROJECTION);
            glLoadIdentity();
            bool isOrtho = true;
            if (isOrtho) {
                glOrtho(-1.0, 1.0, 1.0, -1.0, -1.0, 1.0);
            } else {
                glFrustum(-1.0, 1.0, -1.0, 1.0, 1.5, 20.0);
            }
            
            glMatrixMode(GL_MODELVIEW);
            glLoadIdentity();
        }
        
        void drawApp() {
            context.drawString( pApp->app_out.buffer );
        }
        
        
        static void display() {
            auto _this = global_instance();
            _this->frameCount++;
            
            float g = ((_this->frameCount*5)%100) * (1.0f/100.0f);
        
            glClearColor( 0.5f, g, 0.5f, 0.5 );
            glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
        
            frame_pre();
        
            glMatrixMode(GL_MODELVIEW);
            glLoadIdentity();
        
            //glutSolidSphere(0.5, 9, 5);
            //glutWireCube(0.5);
        
            //glTranslatef(0,0,0.5f);
        
            //draw stuff
            //draw_triangle();
            //draw_unit_quad();
            
            _this->drawApp();
        
            glFlush();
        }
        
        
        static void draw_unit_quad() {
            glBegin(GL_TRIANGLES);
            float v[3] = { 0.5, 0.5, 0.5 };
            
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
        
        
        static void myKeyboardCallback(unsigned char key,
                                int x, int y) {
            if (key == 27) {
                exit(0);
            }
            std::cout << "Pressed key " << (int)key << " or letter '" << key << "' \n";
        }
        
        static void mySpecialKeyFunction(int key, int x, int y) {
            // responds when the user presses a special key.
            
            if ( key == GLUT_KEY_UP ) {
                std::cout << "GLUT_KEY_UP" << "\n";
            }
            if ( key == GLUT_KEY_DOWN ) {
                std::cout << "GLUT_KEY_DOWN" << "\n";
            }
            if ( key == GLUT_KEY_LEFT ) {
                std::cout << "GLUT_KEY_LEFT" << "\n";
            }
            if ( key == GLUT_KEY_RIGHT ) {
                std::cout << "GLUT_KEY_RIGHT" << "\n";
            }
        }
        
        static void myMouseFunc(int button, int state,
                         int x, int y) {
            if (state == GLUT_DOWN) {
                std::cout << "Mouse button " << button << " is down.\n";
            }
            else if (state == GLUT_UP) {
                std::cout << "Mouse button " << button << " is up.\n";
            }
            else {
                std::cout << "Mouse moved to " << x << "," << y << "\n";
            }
        }
        
        static void myMouseMove(int x, int y) {
            int w = glutGet(GLUT_WINDOW_WIDTH);
            int h = glutGet(GLUT_WINDOW_HEIGHT);
            int timeSinceStart = glutGet(GLUT_ELAPSED_TIME);
            float ux = ((float)x) / ((float)w);
            float uy = ((float)y) / ((float)h);
            if ((ux < 0) || (ux > 1) || (uy < 0) || (uy > 1)) {
                return; // out of bounds
            }
            glutPostRedisplay();
            
            //std::cout << "Mouse moved to " << ux << "," << uy << "\n";
        }

        
    };
    
    
    lewdo_glut lewdo_glut_g;
    lewdo_glut* lewdo_glut::global_instance() { return &lewdo_glut_g; }
    
    
}

#endif /* string3_glut_h */