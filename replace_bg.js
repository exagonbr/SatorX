const fs = require('fs');
const file = 'src/public/js/chess3d.mjs';
let code = fs.readFileSync(file, 'utf8');

const oldFunc = `function buildChessClubEnvironment(scene) {
  // clearColor da cena: transparente em createScene — fundo real = camadas CSS com parallax

  // Materiais reutilizáveis
  const mognoDark = new StandardMaterial("mognoDark", scene);`;

const newFunc = `/** Biblioteca vitoriana: fundo 180 graus na tela repetido para cobrir 360 graus, com imagens e efeito parallax 3D real */
function buildChessClubEnvironment(scene) {
  scene.clearColor = new Color4(0.04, 0.03, 0.02, 1);

  // --- CILINDRO DE FUNDO (FAR) ---
  const farMat = new StandardMaterial("bgFarMat", scene);
  farMat.diffuseTexture = new Texture("/img/library-parallax-1.png", scene);
  farMat.diffuseTexture.vScale = -1;
  farMat.diffuseTexture.uScale = -2; // repete a imagem 180 graus 2 vezes para cobrir 360
  farMat.emissiveTexture = farMat.diffuseTexture;
  farMat.disableLighting = true;
  farMat.backFaceCulling = false;
  
  const bgFar = MeshBuilder.CreateCylinder("bgFar", { 
    diameter: 60, 
    height: 32, 
    sideOrientation: Mesh.BACKSIDE 
  }, scene);
  bgFar.material = farMat;
  bgFar.position.set(0, 5, 0);

  // --- CILINDRO DA FRENTE (NEAR) ---
  const nearMat = new StandardMaterial("bgNearMat", scene);
  nearMat.diffuseTexture = new Texture("/img/library-parallax-2.png", scene);
  nearMat.diffuseTexture.vScale = -1;
  nearMat.diffuseTexture.uScale = -2;
  nearMat.diffuseTexture.hasAlpha = false;
  nearMat.alpha = 0.55; 
  nearMat.emissiveTexture = nearMat.diffuseTexture;
  nearMat.disableLighting = true;
  nearMat.backFaceCulling = false;

  const bgNear = MeshBuilder.CreateCylinder("bgNear", { 
    diameter: 50, 
    height: 28, 
    sideOrientation: Mesh.BACKSIDE 
  }, scene);
  bgNear.material = nearMat;
  bgNear.position.set(0, 5, 0);
  
  // Piso escuro para conectar a sala
  const darkFloor = new StandardMaterial("darkFloor", scene);
  darkFloor.diffuseColor  = new Color3(0.06, 0.04, 0.02);
  darkFloor.specularColor = new Color3(0.05, 0.03, 0.01);
  darkFloor.specularPower = 10;
  
  const floor = MeshBuilder.CreateGround("libFloor", { width: 60, height: 60 }, scene);
  floor.position.set(0, -0.22, 0);
  floor.material = darkFloor;`;

const endIndex = code.indexOf(`/** Nome antigo do cenário`);
const startIndex = code.indexOf(`function buildChessClubEnvironment(scene) {`);

if (startIndex !== -1 && endIndex !== -1) {
  const finalCode = code.substring(0, startIndex) + newFunc + '\n}\n\n' + code.substring(endIndex);
  fs.writeFileSync(file, finalCode, 'utf8');
  console.log('Replaced successfully!');
} else {
  console.log('Could not find indices', startIndex, endIndex);
}
