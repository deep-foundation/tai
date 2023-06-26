import React from 'react';
// @ts-ignore
import Particles from "react-tsparticles";

import { useCallback } from "react";
import type { Container, Engine } from "tsparticles-engine";
//@ts-ignore
import { loadFull } from "tsparticles";
import { Box } from '@chakra-ui/react';


export function BackgroundProbableQuestions() {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (<Box sx={{
        background: 'linear-gradient(0deg, #417100 0%, #0f4801 20%, #092a01 45%, #03001d 70%)',
        width: '100%',
        height: '100%',
        position: 'absolute',
      }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}

        options={{
          fullScreen: {
            enable: true,
            zIndex: 1
          },
          particles: {
            number: {
              value: 10,
              density: {
                enable: false,
                value_area: 800
              }
            },
            color: {
              value: "#fff"
            },
            shape: {
              character: {
                fill: true,
                font: "Verdana",
                style: "",
                value: ["what is your mood?", "I want to relax", "life is Beautiful", "Hello", "I want to go to the mountains", "Is the unconscious following you?", "Reality is just a dot", "I want to go to the sea", "Fear is the mind-killer"],
                weight: "400"
              },
            polygon: { nb_sides: 5 },
            stroke: { color: "#ffffff", width: 1 },
            type: "char",
              // "type": "star",
              options: {
                  // sides: 5
              }
            },
            opacity: {
              value: 1,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
              }
            },
            size: {
              value: 12,
              random: false,
              anim: {
                enable: false,
                speed: 30,
                size_min: 0.1,
                sync: false
              }
            },
            rotate: {
              value: 0,
              random: true,
              direction: "clockwise",
              animation: {
                enable: true,
                speed: 2,
                sync: false
              }
            },
            line_linked: {
              enable: true,
              distance: 600,
              color: "#ffffff",
              opacity: 0.4,
              width: 2
            },
            move: {
              enable: true,
              speed: 2,
              direction: 'none',
              random: false,
              straight: false,
              out_mode: 'bounce',
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
              }
            }
          },
          interactivity: {
            events: {
              onhover: {
                enable: true,
                mode: 'grab'
              },
              onclick: {
                enable: true,
                mode: "push"
              },
              resize: true
            },
            modes: {
              grab: {
                distance: 400,
                particles_nb: 2,
                line_linked: {
                  opacity: 0.7
                }
              },
              trail: {
                distance: 200,
                line_linked: {
                  opacity: 1
                }
              },
              bubble: {
                distance: 400,
                size: 4,
                duration: 2,
                opacity: 0.8,
                speed: 1
              },
              repulse: {
                distance: 200
              },
              push: {
                particles_nb: 1
              },
              remove: {
                particles_nb: 1
              }
            }
          },
          retina_detect: true,
          background: {
            // color: "#19202B",
            image: "",
            position: "50% 50%",
            repeat: "no-repeat",
            size: "cover"
          }
        }}
      />
    </Box>
  );
}
