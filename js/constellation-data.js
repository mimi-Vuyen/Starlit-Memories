/* J2000 Hipparcos positions; line segments follow the Stellarium/Skyfield western stick figure. */
(function () {
  "use strict";

  window.StarlitMemories = window.StarlitMemories || {};
  window.StarlitMemories.constellation = {
    stars: [
      { id: 78820, name: "Graffias", ra: 16.090619, dec: -19.805389, magnitude: 2.62, memoryId: 1 },
      { id: 78401, name: "Dschubba", ra: 16.005558, dec: -22.621611, magnitude: 2.29, memoryId: 2 },
      { id: 78265, name: "Fang", ra: 15.980867, dec: -26.114056, magnitude: 2.89, memoryId: 3 },
      { id: 80112, name: "Alniyat", ra: 16.353144, dec: -25.592750, magnitude: 2.90, memoryId: 4 },
      { id: 80763, name: "Antares", ra: 16.490131, dec: -26.431944, magnitude: 0.91, memoryId: 5 },
      { id: 81266, name: "Tau Scorpii", ra: 16.598044, dec: -28.215972, magnitude: 2.82, memoryId: 6 },
      { id: 82396, name: "Larawag", ra: 16.836178, dec: -34.292611, magnitude: 2.29, memoryId: 7 },
      { id: 82514, name: "Mu1 Scorpii", ra: 16.864511, dec: -38.047333, magnitude: 3.00 },
      { id: 82729, name: "Zeta2 Scorpii", ra: 16.909753, dec: -42.360750, magnitude: 3.62 },
      { id: 84143, name: "Eta Scorpii", ra: 17.202550, dec: -43.238500, magnitude: 3.33 },
      { id: 86228, name: "Sargas", ra: 17.621981, dec: -42.997833, magnitude: 1.86 },
      { id: 87073, name: "Iota1 Scorpii", ra: 17.793078, dec: -40.126972, magnitude: 2.99 },
      { id: 86670, name: "Girtab", ra: 17.708133, dec: -39.029917, magnitude: 2.39 },
      { id: 85927, name: "Shaula", ra: 17.560147, dec: -37.103750, magnitude: 1.62, memoryId: 8 },
      { id: 85696, name: "Lesath", ra: 17.512733, dec: -37.295750, magnitude: 2.70, memoryId: 9 },
      { id: 87261, name: "G Scorpii", ra: 17.830958, dec: -37.043361, magnitude: 3.19 },
      { id: 79374, name: "Jabbah", ra: 16.199928, dec: -19.460639, magnitude: 4.00 },
      { id: 78104, name: "Rho Scorpii", ra: 15.948081, dec: -29.213999, magnitude: 3.87 }
    ],
    lines: [
      [78820, 78401],
      [78401, 78265],
      [78401, 80112],
      [80112, 80763],
      [80763, 81266],
      [81266, 82396],
      [82396, 82514],
      [82514, 82729],
      [82729, 84143],
      [84143, 86228],
      [86228, 87073],
      [87073, 86670],
      [86670, 85696],
      [85696, 85927],
      [85927, 87261],
      [78820, 79374],
      [79374, 78265],
      [78265, 78104]
    ]
  };
})();
