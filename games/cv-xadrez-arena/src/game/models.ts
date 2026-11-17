import * as THREE from 'three';
import {
  BOARD_PLAYABLE_HALF,
  BOARD_RIM_WIDTH,
  BOARD_SQUARES,
  FILES,
  PIECE_COLLISION_RADIUS,
  PUNCH_ACTIVE_END,
  PUNCH_DURATION,
  PUNCH_WINDUP_END,
  RANKS,
  SQUARE_SIZE,
  squareToWorld,
  type PieceType,
  type PlayerColor,
} from './constants';

export interface CharacterRig {
  root: THREE.Group;
  bodyPivot: THREE.Group;
  pelvis: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftShoulder: THREE.Group;
  leftUpperArm: THREE.Group;
  leftElbow: THREE.Group;
  leftHandMesh: THREE.Mesh;
  leftGlove: THREE.Group;
  rightShoulder: THREE.Group;
  rightUpperArm: THREE.Group;
  rightElbow: THREE.Group;
  rightHandMesh: THREE.Mesh;
  rightGlove: THREE.Group;
  gloveBodyMat: THREE.MeshPhysicalMaterial;
  gloveCuffMat: THREE.MeshStandardMaterial;
  leftHip: THREE.Group;
  rightHip: THREE.Group;
  shadowDisc: THREE.Mesh;
}

export interface PiecePartSpec {
  geo: THREE.BufferGeometry;
  materialKind: 'body' | 'gold' | 'felt';
  pos?: [number, number, number];
  rotY?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  isKnightHead?: boolean;
}

export interface SharedAssets {
  disposables: Array<{ dispose: () => void }>;
  contactShadowGeo: THREE.CircleGeometry;
  contactShadowMat: THREE.MeshBasicMaterial;
  whitePieceMat: THREE.MeshPhysicalMaterial;
  blackPieceMat: THREE.MeshPhysicalMaterial;
  goldAccentMat: THREE.MeshStandardMaterial;
  feltMat: THREE.MeshStandardMaterial;
  pieceTemplates: Map<PieceType, PiecePartSpec[]>;
}

function createWoodGrainTexture(
  baseHex: string,
  grainHex: string,
  anisotropy: number,
  isColor: boolean,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = grainHex;
  for (let i = 0; i < 65; i++) {
    ctx.globalAlpha = 0.08 + (i % 5) * 0.03;
    ctx.lineWidth = 1 + (i % 3);
    ctx.beginPath();
    const y = (i / 65) * 256;
    ctx.moveTo(0, y);
    for (let x = 0; x <= 256; x += 32) {
      ctx.lineTo(x, y + Math.sin(x * 0.04 + i) * 3.5);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = anisotropy;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(12, 10, 8, 0.55)');
  grad.addColorStop(0.55, 'rgba(12, 10, 8, 0.24)');
  grad.addColorStop(1, 'rgba(12, 10, 8, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createLabelAtlasTexture(labels: readonly string[]): THREE.CanvasTexture {
  const cols = 8;
  const rows = 2;
  const cellSize = 128;
  const canvas = document.createElement('canvas');
  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#d4b483';
  ctx.font = '600 68px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < labels.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    ctx.fillText(labels[i], col * cellSize + 64, row * cellSize + 66);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createLabelPlaneGeometry(cellIndex: number): THREE.PlaneGeometry {
  const cols = 8;
  const rows = 2;
  const col = cellIndex % cols;
  const row = Math.floor(cellIndex / cols);
  const geo = new THREE.PlaneGeometry(0.8, 0.8);
  geo.rotateX(-Math.PI / 2);
  const uv = geo.attributes.uv;
  const u0 = col / cols;
  const v0 = 1 - (row + 1) / rows;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, u0 + uv.getX(i) / cols, v0 + uv.getY(i) / rows);
  }
  uv.needsUpdate = true;
  return geo;
}

export function createSharedAssets(maxAnisotropy: number): SharedAssets {
  const disposables: Array<{ dispose: () => void }> = [];

  const lightWoodTex = createWoodGrainTexture('#ede3d2', '#cbbba1', maxAnisotropy, true);
  const darkWoodTex = createWoodGrainTexture('#292c34', '#16181d', maxAnisotropy, true);
  const bumpTex = createWoodGrainTexture('#808080', '#585858', maxAnisotropy, false);
  const shadowTex = createContactShadowTexture();
  disposables.push(lightWoodTex, darkWoodTex, bumpTex, shadowTex);

  const whitePieceMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: lightWoodTex,
    bumpMap: bumpTex,
    bumpScale: 0.015,
    roughness: 0.28,
    metalness: 0.04,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
  });

  const blackPieceMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: darkWoodTex,
    bumpMap: bumpTex,
    bumpScale: 0.015,
    roughness: 0.32,
    metalness: 0.08,
    clearcoat: 0.3,
    clearcoatRoughness: 0.28,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd4a95a,
    roughness: 0.26,
    metalness: 0.85,
  });

  const feltMat = new THREE.MeshStandardMaterial({
    color: 0x26543d,
    roughness: 0.92,
    metalness: 0.0,
  });

  const contactShadowGeo = new THREE.CircleGeometry(1, 24);
  contactShadowGeo.rotateX(-Math.PI / 2);
  const contactShadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.85,
  });

  disposables.push(
    whitePieceMat,
    blackPieceMat,
    goldAccentMat,
    feltMat,
    contactShadowGeo,
    contactShadowMat,
  );

  return {
    disposables,
    contactShadowGeo,
    contactShadowMat,
    whitePieceMat,
    blackPieceMat,
    goldAccentMat,
    feltMat,
    pieceTemplates: new Map<PieceType, PiecePartSpec[]>(),
  };
}

export function buildChessboardArena(
  assets: SharedAssets,
  maxAnisotropy: number,
  castShadows: boolean,
): THREE.Group {
  const group = new THREE.Group();

  const lightTileTex = createWoodGrainTexture('#efe5d5', '#d5c5ab', maxAnisotropy, true);
  const darkTileTex = createWoodGrainTexture('#4e594d', '#374036', maxAnisotropy, true);
  const walnutTex = createWoodGrainTexture('#4a2f1d', '#2b190d', maxAnisotropy, true);
  const tableTex = createWoodGrainTexture('#2c241d', '#1d1712', maxAnisotropy, true);
  tableTex.repeat.set(8, 8);
  assets.disposables.push(lightTileTex, darkTileTex, walnutTex, tableTex);

  const lightTileMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: lightTileTex,
    roughness: 0.36,
    metalness: 0.03,
  });
  const darkTileMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: darkTileTex,
    roughness: 0.42,
    metalness: 0.05,
  });
  const walnutMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: walnutTex,
    roughness: 0.48,
    metalness: 0.06,
  });
  const tableMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: tableTex,
    roughness: 0.78,
    metalness: 0.02,
  });
  assets.disposables.push(lightTileMat, darkTileMat, walnutMat, tableMat);

  // Expansive studio workshop tabletop underneath the chessboard (prevents floating void)
  const tableGeo = new THREE.CylinderGeometry(72, 74, 2.0, 48);
  const tableMesh = new THREE.Mesh(tableGeo, tableMat);
  tableMesh.position.y = -2.25;
  tableMesh.receiveShadow = true;
  group.add(tableMesh);
  assets.disposables.push(tableGeo);

  // Walnut chessboard base slab (top sits slightly below tile tops so tiles meet at Y=0)
  const outerSize = (BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH) * 2;
  const baseGeo = new THREE.BoxGeometry(outerSize, 1.15, outerSize);
  const baseMesh = new THREE.Mesh(baseGeo, walnutMat);
  baseMesh.position.y = -0.68;
  baseMesh.receiveShadow = true;
  baseMesh.castShadow = castShadows;
  group.add(baseMesh);
  assets.disposables.push(baseGeo);

  // Raised perimeter rim planks around the 8x8 grid at Y=0 so characters can walk on the rim too!
  const rimLevelY = -0.06;
  const innerSpan = BOARD_PLAYABLE_HALF * 2;
  const rimParts: Array<[number, number, number, number]> = [
    [outerSize, BOARD_RIM_WIDTH, 0, -(BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH / 2)],
    [outerSize, BOARD_RIM_WIDTH, 0, BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH / 2],
    [BOARD_RIM_WIDTH, innerSpan, -(BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH / 2), 0],
    [BOARD_RIM_WIDTH, innerSpan, BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH / 2, 0],
  ];
  for (const [w, d, px, pz] of rimParts) {
    const rimGeo = new THREE.BoxGeometry(w, 0.14, d);
    const rim = new THREE.Mesh(rimGeo, walnutMat);
    rim.position.set(px, rimLevelY, pz);
    rim.receiveShadow = true;
    group.add(rim);
    assets.disposables.push(rimGeo);
  }

  // Brass corner brackets for craftsmanship detail
  const cornerOffset = BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH - 0.35;
  const bracketGeo = new THREE.BoxGeometry(0.95, 0.18, 0.95);
  assets.disposables.push(bracketGeo);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const bracket = new THREE.Mesh(bracketGeo, assets.goldAccentMat);
      bracket.position.set(sx * cornerOffset, -0.04, sz * cornerOffset);
      bracket.receiveShadow = true;
      group.add(bracket);
    }
  }

  // 64 Squares via 2 InstancedMeshes (32 light, 32 dark) for crisp bevel & top at Y=0
  const tileGeo = new THREE.BoxGeometry(SQUARE_SIZE - 0.04, 0.16, SQUARE_SIZE - 0.04);
  assets.disposables.push(tileGeo);
  const lightInst = new THREE.InstancedMesh(tileGeo, lightTileMat, 32);
  const darkInst = new THREE.InstancedMesh(tileGeo, darkTileMat, 32);
  lightInst.receiveShadow = true;
  darkInst.receiveShadow = true;

  const dummy = new THREE.Object3D();
  let lIdx = 0;
  let dIdx = 0;
  for (let r = 0; r < BOARD_SQUARES; r++) {
    for (let f = 0; f < BOARD_SQUARES; f++) {
      const sq = `${FILES[f]}${RANKS[r]}`;
      const pos = squareToWorld(sq);
      dummy.position.set(pos.x, -0.08, pos.z);
      dummy.updateMatrix();
      const isLight = (f + r) % 2 === 1; // a1 is dark (0+0=0), h1 is light (7+0=7)
      if (isLight) {
        lightInst.setMatrixAt(lIdx++, dummy.matrix);
      } else {
        darkInst.setMatrixAt(dIdx++, dummy.matrix);
      }
    }
  }
  lightInst.instanceMatrix.needsUpdate = true;
  darkInst.instanceMatrix.needsUpdate = true;
  lightInst.computeBoundingSphere();
  darkInst.computeBoundingSphere();
  group.add(lightInst, darkInst);

  // Algebraic rank & file decals along board edge using 1 shared atlas texture + 1 material
  const allLabels = [
    ...FILES.map((f) => f.toUpperCase()),
    ...RANKS,
  ];
  const labelAtlasTex = createLabelAtlasTexture(allLabels);
  const labelMat = new THREE.MeshBasicMaterial({
    map: labelAtlasTex,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  assets.disposables.push(labelAtlasTex, labelMat);

  for (let f = 0; f < 8; f++) {
    const decalGeo = createLabelPlaneGeometry(f);
    assets.disposables.push(decalGeo);
    const pos = squareToWorld(`${FILES[f]}1`);
    const label = new THREE.Mesh(decalGeo, labelMat);
    label.position.set(pos.x, 0.015, BOARD_PLAYABLE_HALF + 0.78);
    group.add(label);
  }

  for (let r = 0; r < 8; r++) {
    const decalGeo = createLabelPlaneGeometry(8 + r);
    assets.disposables.push(decalGeo);
    const pos = squareToWorld(`a${RANKS[r]}`);
    const label = new THREE.Mesh(decalGeo, labelMat);
    label.position.set(-(BOARD_PLAYABLE_HALF + 0.78), 0.015, pos.z);
    group.add(label);
  }

  // Two side capture trays resting beside the board
  const trayGeo = new THREE.BoxGeometry(4.4, 0.45, 18.6);
  const trayInnerMat = new THREE.MeshStandardMaterial({
    color: 0x1e2c24,
    roughness: 0.9,
    metalness: 0.0,
  });
  assets.disposables.push(trayGeo, trayInnerMat);
  for (const sx of [-1, 1]) {
    const tray = new THREE.Mesh(trayGeo, walnutMat);
    tray.position.set(sx * (BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH + 2.7), -0.5, 0);
    tray.receiveShadow = true;
    group.add(tray);

    const feltGeo = new THREE.PlaneGeometry(3.8, 17.8);
    feltGeo.rotateX(-Math.PI / 2);
    const felt = new THREE.Mesh(feltGeo, trayInnerMat);
    felt.position.set(sx * (BOARD_PLAYABLE_HALF + BOARD_RIM_WIDTH + 2.7), -0.265, 0);
    felt.receiveShadow = true;
    group.add(felt);
    assets.disposables.push(feltGeo);
  }

  return group;
}

function createLatheProfile(points: Array<[number, number]>, segments = 24): THREE.LatheGeometry {
  const vecs = points.map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(vecs, segments);
}

function getOrCreatePieceTemplate(type: PieceType, assets: SharedAssets): PiecePartSpec[] {
  const cached = assets.pieceTemplates.get(type);
  if (cached) return cached;

  const specs: PiecePartSpec[] = [];
  const colRadius = PIECE_COLLISION_RADIUS[type];

  // 1. Felted base ring (grounded at Y = 0)
  const feltGeo = new THREE.CylinderGeometry(colRadius * 0.98, colRadius * 1.0, 0.06, 22);
  assets.disposables.push(feltGeo);
  specs.push({
    geo: feltGeo,
    materialKind: 'felt',
    pos: [0, 0.03, 0],
    receiveShadow: true,
  });

  // 2. Sculpted Lathe body + distinct top crown per piece type
  let latheGeo: THREE.LatheGeometry;
  if (type === 'p') {
    latheGeo = createLatheProfile([
      [0, 0.06],
      [0.52, 0.06],
      [0.54, 0.2],
      [0.36, 0.36],
      [0.24, 0.72],
      [0.18, 1.05],
      [0.32, 1.14],
      [0.16, 1.2],
      [0.28, 1.38],
      [0.26, 1.54],
      [0, 1.65],
    ]);
  } else if (type === 'r') {
    latheGeo = createLatheProfile([
      [0, 0.06],
      [0.62, 0.06],
      [0.64, 0.22],
      [0.44, 0.4],
      [0.34, 1.15],
      [0.48, 1.35],
      [0.5, 1.78],
      [0.32, 1.78],
      [0.32, 1.62],
      [0, 1.62],
    ]);
    // Battlement merlons around rook crown
    const merlonGeo = new THREE.BoxGeometry(0.19, 0.22, 0.16);
    assets.disposables.push(merlonGeo);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      specs.push({
        geo: merlonGeo,
        materialKind: 'body',
        pos: [Math.cos(a) * 0.41, 1.88, Math.sin(a) * 0.41],
        rotY: -a,
        castShadow: true,
        receiveShadow: true,
      });
    }
  } else if (type === 'b') {
    latheGeo = createLatheProfile([
      [0, 0.06],
      [0.58, 0.06],
      [0.6, 0.22],
      [0.42, 0.42],
      [0.26, 1.2],
      [0.38, 1.32],
      [0.22, 1.42],
      [0.34, 1.75],
      [0.24, 2.08],
      [0.08, 2.22],
      [0.12, 2.3],
      [0, 2.36],
    ]);
    const collarGeo = new THREE.TorusGeometry(0.3, 0.05, 10, 24);
    collarGeo.rotateX(Math.PI / 2);
    assets.disposables.push(collarGeo);
    specs.push({
      geo: collarGeo,
      materialKind: 'gold',
      pos: [0, 1.32, 0],
    });
  } else if (type === 'n') {
    // Turned pedestal + sculpted horse silhouette head
    latheGeo = createLatheProfile([
      [0, 0.06],
      [0.62, 0.06],
      [0.64, 0.24],
      [0.45, 0.44],
      [0.38, 0.65],
      [0, 0.68],
    ]);
    const horseShape = new THREE.Shape();
    horseShape.moveTo(-0.34, 0.0);
    horseShape.lineTo(0.34, 0.0);
    horseShape.quadraticCurveTo(0.42, 0.55, 0.22, 1.08);
    horseShape.lineTo(0.32, 1.32); // ears
    horseShape.lineTo(0.12, 1.26);
    horseShape.lineTo(-0.36, 1.02); // snout
    horseShape.lineTo(-0.34, 0.78);
    horseShape.lineTo(-0.1, 0.72);
    horseShape.quadraticCurveTo(-0.22, 0.4, -0.34, 0.0);

    const horseGeo = new THREE.ExtrudeGeometry(horseShape, {
      depth: 0.36,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.06,
      bevelSegments: 2,
    });
    horseGeo.translate(0, 0.64, -0.18);
    assets.disposables.push(horseGeo);
    specs.push({
      geo: horseGeo,
      materialKind: 'body',
      castShadow: true,
      receiveShadow: true,
      isKnightHead: true,
    });
  } else if (type === 'q') {
    latheGeo = createLatheProfile([
      [0, 0.06],
      [0.68, 0.06],
      [0.7, 0.25],
      [0.48, 0.48],
      [0.3, 1.48],
      [0.46, 1.66],
      [0.26, 1.78],
      [0.44, 2.26],
      [0.32, 2.42],
      [0.14, 2.58],
      [0, 2.68],
    ]);
    const crownBeadGeo = new THREE.SphereGeometry(0.08, 10, 10);
    assets.disposables.push(crownBeadGeo);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      specs.push({
        geo: crownBeadGeo,
        materialKind: 'gold',
        pos: [Math.cos(a) * 0.36, 2.42, Math.sin(a) * 0.36],
      });
    }
    const orbGeo = new THREE.SphereGeometry(0.14, 14, 14);
    assets.disposables.push(orbGeo);
    specs.push({
      geo: orbGeo,
      materialKind: 'gold',
      pos: [0, 2.72, 0],
    });
  } else {
    // King
    latheGeo = createLatheProfile([
      [0, 0.06],
      [0.72, 0.06],
      [0.74, 0.26],
      [0.52, 0.52],
      [0.33, 1.65],
      [0.5, 1.85],
      [0.3, 1.98],
      [0.46, 2.46],
      [0.28, 2.56],
      [0, 2.58],
    ]);
    const crossVGeo = new THREE.BoxGeometry(0.14, 0.46, 0.14);
    const crossHGeo = new THREE.BoxGeometry(0.36, 0.13, 0.14);
    assets.disposables.push(crossVGeo, crossHGeo);
    specs.push(
      { geo: crossVGeo, materialKind: 'gold', pos: [0, 2.82, 0], castShadow: true },
      { geo: crossHGeo, materialKind: 'gold', pos: [0, 2.88, 0], castShadow: true },
    );
  }

  assets.disposables.push(latheGeo);
  specs.push({
    geo: latheGeo,
    materialKind: 'body',
    castShadow: true,
    receiveShadow: true,
  });

  // Subtle brass collar ring on heavy pieces
  if (type === 'q' || type === 'k') {
    const ringGeo = new THREE.TorusGeometry(0.37, 0.045, 10, 24);
    ringGeo.rotateX(Math.PI / 2);
    assets.disposables.push(ringGeo);
    specs.push({
      geo: ringGeo,
      materialKind: 'gold',
      pos: [0, type === 'k' ? 1.84 : 1.66, 0],
    });
  }

  assets.pieceTemplates.set(type, specs);
  return specs;
}

export function buildChessPieceGroup(
  type: PieceType,
  color: PlayerColor,
  assets: SharedAssets,
  castShadows: boolean,
): THREE.Group {
  const root = new THREE.Group();
  const bodyMat = color === 'w' ? assets.whitePieceMat : assets.blackPieceMat;
  const colRadius = PIECE_COLLISION_RADIUS[type];
  const specs = getOrCreatePieceTemplate(type, assets);

  for (const spec of specs) {
    const mat =
      spec.materialKind === 'body'
        ? bodyMat
        : spec.materialKind === 'gold'
          ? assets.goldAccentMat
          : assets.feltMat;
    const mesh = new THREE.Mesh(spec.geo, mat);
    if (spec.pos) {
      mesh.position.set(spec.pos[0], spec.pos[1], spec.pos[2]);
    }
    if (spec.isKnightHead) {
      mesh.rotation.y = color === 'w' ? Math.PI / 2 : -Math.PI / 2;
    } else if (spec.rotY !== undefined) {
      mesh.rotation.y = spec.rotY;
    }
    if (spec.castShadow) {
      mesh.castShadow = castShadows;
    }
    if (spec.receiveShadow) {
      mesh.receiveShadow = true;
    }
    root.add(mesh);
  }

  // Soft contact shadow disc on ground beneath piece
  const shadow = new THREE.Mesh(assets.contactShadowGeo, assets.contactShadowMat);
  shadow.scale.setScalar(colRadius * 1.45);
  shadow.position.y = 0.015;
  root.add(shadow);
  root.userData.shadowDisc = shadow;

  return root;
}

export function buildCharacterRig(
  color: PlayerColor,
  assets: SharedAssets,
  castShadows: boolean,
): CharacterRig {
  const isWhiteTeam = color === 'w';
  // White Team: pearl-white suit, bright ivory armor details, cool sky-silver trim
  // Black Team: deep obsidian suit, onyx armor details, dark slate-steel trim
  const skinColor = isWhiteTeam ? 0xf6f7fb : 0x202531;
  const armorColor = isWhiteTeam ? 0xffffff : 0x0b0f18;
  const trimColor = isWhiteTeam ? 0xbfdbfe : 0x475569;
  const shoeColor = isWhiteTeam ? 0xdbeafe : 0x111827;

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.68,
    metalness: 0.04,
  });
  const armorMat = new THREE.MeshStandardMaterial({
    color: armorColor,
    roughness: 0.36,
    metalness: 0.14,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: trimColor,
    roughness: 0.4,
    metalness: 0.2,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: shoeColor,
    roughness: 0.52,
    metalness: 0.06,
  });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: isWhiteTeam ? 0x0f172a : 0xf8fafc,
    roughness: 0.2,
  });
  const boxingGloveRedMat = new THREE.MeshPhysicalMaterial({
    color: 0xdc2626,
    emissive: 0x3b0707,
    roughness: 0.34,
    metalness: 0.08,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
  });
  const gloveCuffMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.55,
    metalness: 0.05,
  });
  assets.disposables.push(
    skinMat,
    armorMat,
    trimMat,
    shoeMat,
    eyeMat,
    boxingGloveRedMat,
    gloveCuffMat,
  );

  const root = new THREE.Group();
  const bodyPivot = new THREE.Group();
  root.add(bodyPivot);

  // Contact shadow disc
  const shadowDisc = new THREE.Mesh(assets.contactShadowGeo, assets.contactShadowMat);
  shadowDisc.scale.setScalar(0.95);
  shadowDisc.position.y = 0.018;
  root.add(shadowDisc);

  // Pelvis (centered at hip height ~1.05)
  const pelvis = new THREE.Group();
  pelvis.position.set(0, 1.05, 0);
  bodyPivot.add(pelvis);

  const pelvisGeo = new THREE.SphereGeometry(0.42, 16, 14);
  pelvisGeo.scale(1.05, 0.75, 0.92);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, armorMat);
  pelvisMesh.castShadow = castShadows;
  pelvisMesh.receiveShadow = true;
  pelvis.add(pelvisMesh);
  assets.disposables.push(pelvisGeo);

  // Torso (stacked atop pelvis)
  const torso = new THREE.Group();
  torso.position.set(0, 0.25, 0);
  pelvis.add(torso);

  const torsoGeo = new THREE.CapsuleGeometry(0.4, 0.52, 8, 16);
  const torsoMesh = new THREE.Mesh(torsoGeo, skinMat);
  torsoMesh.position.y = 0.48;
  torsoMesh.castShadow = castShadows;
  torsoMesh.receiveShadow = true;
  torso.add(torsoMesh);
  assets.disposables.push(torsoGeo);

  // Team armor chest vest + belt sash so White vs Black team identity is unmistakable
  const vestGeo = new THREE.CylinderGeometry(0.418, 0.412, 0.34, 16);
  const vest = new THREE.Mesh(vestGeo, armorMat);
  vest.position.y = 0.64;
  vest.castShadow = castShadows;
  torso.add(vest);

  const sashGeo = new THREE.CylinderGeometry(0.42, 0.425, 0.16, 16);
  const sash = new THREE.Mesh(sashGeo, trimMat);
  sash.position.y = 0.33;
  sash.castShadow = castShadows;
  torso.add(sash);
  assets.disposables.push(vestGeo, sashGeo);

  // Head
  const head = new THREE.Group();
  head.position.set(0, 1.08, 0);
  torso.add(head);

  const headGeo = new THREE.SphereGeometry(0.41, 18, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.position.y = 0.36;
  headMesh.castShadow = castShadows;
  headMesh.receiveShadow = true;
  head.add(headMesh);
  assets.disposables.push(headGeo);

  // Team-colored headband + crown stripe so White & Black teams are unmistakable from any angle
  const bandGeo = new THREE.TorusGeometry(0.395, 0.068, 10, 22);
  bandGeo.rotateX(Math.PI / 2);
  const band = new THREE.Mesh(bandGeo, armorMat);
  band.position.y = 0.47;
  head.add(band);

  const crestGeo = new THREE.BoxGeometry(0.14, 0.12, 0.24);
  const crest = new THREE.Mesh(crestGeo, trimMat);
  crest.position.set(0, 0.55, 0.28);
  head.add(crest);
  assets.disposables.push(bandGeo, crestGeo);

  // Expressive eyes + tiny button nose facing +Z
  const eyeGeo = new THREE.SphereGeometry(0.055, 10, 10);
  assets.disposables.push(eyeGeo);
  for (const sx of [-0.14, 0.14]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(sx, 0.37, 0.365);
    head.add(eye);
  }
  const noseGeo = new THREE.SphereGeometry(0.065, 10, 10);
  const nose = new THREE.Mesh(noseGeo, skinMat);
  nose.position.set(0, 0.29, 0.41);
  head.add(nose);
  assets.disposables.push(noseGeo);

  // Articulated Arms (Shoulder -> Upper Arm -> Elbow -> Forearm -> Mitten Hand + Red Boxing Glove Indicator)
  const shoulderPadGeo = new THREE.SphereGeometry(0.165, 12, 10);
  const upperArmGeo = new THREE.CapsuleGeometry(0.115, 0.38, 6, 12);
  upperArmGeo.translate(0, -0.22, 0);
  const forearmGeo = new THREE.CapsuleGeometry(0.1, 0.36, 6, 12);
  forearmGeo.translate(0, -0.2, 0);
  const handGeo = new THREE.SphereGeometry(0.145, 12, 12);
  const gloveBodyGeo = new THREE.SphereGeometry(0.168, 14, 12);
  gloveBodyGeo.scale(1.06, 1.04, 1.2);
  const gloveThumbGeo = new THREE.SphereGeometry(0.068, 10, 10);
  const gloveCuffGeo = new THREE.CylinderGeometry(0.116, 0.124, 0.11, 14);
  assets.disposables.push(
    shoulderPadGeo,
    upperArmGeo,
    forearmGeo,
    handGeo,
    gloveBodyGeo,
    gloveThumbGeo,
    gloveCuffGeo,
  );

  const makeArm = (sideSign: number) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(sideSign * 0.48, 0.86, 0);
    torso.add(shoulder);

    const shoulderPad = new THREE.Mesh(shoulderPadGeo, armorMat);
    shoulderPad.castShadow = castShadows;
    shoulder.add(shoulderPad);

    const upperArm = new THREE.Group();
    shoulder.add(upperArm);
    const upperMesh = new THREE.Mesh(upperArmGeo, skinMat);
    upperMesh.castShadow = castShadows;
    upperArm.add(upperMesh);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.46, 0);
    upperArm.add(elbow);
    const foreMesh = new THREE.Mesh(forearmGeo, skinMat);
    foreMesh.castShadow = castShadows;
    elbow.add(foreMesh);

    const handMesh = new THREE.Mesh(handGeo, trimMat);
    handMesh.position.set(0, -0.44, 0);
    handMesh.castShadow = castShadows;
    elbow.add(handMesh);

    // Compact red boxing glove attachment layered cleanly over the hand mesh
    const gloveGroup = new THREE.Group();
    const gloveMain = new THREE.Mesh(gloveBodyGeo, boxingGloveRedMat);
    gloveMain.castShadow = castShadows;
    gloveGroup.add(gloveMain);

    const gloveThumb = new THREE.Mesh(gloveThumbGeo, boxingGloveRedMat);
    gloveThumb.position.set(-sideSign * 0.11, 0.02, 0.09);
    gloveThumb.castShadow = castShadows;
    gloveGroup.add(gloveThumb);

    const gloveCuff = new THREE.Mesh(gloveCuffGeo, gloveCuffMat);
    gloveCuff.position.set(0, 0.145, 0);
    gloveCuff.castShadow = castShadows;
    gloveGroup.add(gloveCuff);

    handMesh.add(gloveGroup);

    return { shoulder, upperArm, elbow, handMesh, gloveGroup };
  };

  const leftArm = makeArm(1);
  const rightArm = makeArm(-1);

  // Articulated Legs + Rounded Shoes
  const legGeo = new THREE.CapsuleGeometry(0.14, 0.52, 6, 12);
  legGeo.translate(0, -0.34, 0);
  const footGeo = new THREE.CapsuleGeometry(0.14, 0.18, 6, 12);
  footGeo.rotateX(Math.PI / 2);
  assets.disposables.push(legGeo, footGeo);

  const makeLeg = (sideSign: number) => {
    const hip = new THREE.Group();
    hip.position.set(sideSign * 0.22, -0.1, 0);
    pelvis.add(hip);

    const legMesh = new THREE.Mesh(legGeo, skinMat);
    legMesh.castShadow = castShadows;
    hip.add(legMesh);

    const footMesh = new THREE.Mesh(footGeo, shoeMat);
    footMesh.position.set(0, -0.82, 0.08);
    footMesh.castShadow = castShadows;
    hip.add(footMesh);

    return hip;
  };

  const leftHip = makeLeg(-1);
  const rightHip = makeLeg(1);

  return {
    root,
    bodyPivot,
    pelvis,
    torso,
    head,
    leftShoulder: leftArm.shoulder,
    leftUpperArm: leftArm.upperArm,
    leftElbow: leftArm.elbow,
    leftHandMesh: leftArm.handMesh,
    leftGlove: leftArm.gloveGroup,
    rightShoulder: rightArm.shoulder,
    rightUpperArm: rightArm.upperArm,
    rightElbow: rightArm.elbow,
    rightHandMesh: rightArm.handMesh,
    rightGlove: rightArm.gloveGroup,
    gloveBodyMat: boxingGloveRedMat,
    gloveCuffMat,
    leftHip,
    rightHip,
    shadowDisc,
  };
}

export function updateCharacterRigAnimation(
  rig: CharacterRig,
  state: {
    x: number;
    y: number;
    z: number;
    yaw: number;
    grounded: boolean;
    walkCycle: number;
    speedRatio: number;
    leanPitch: number;
    leanRoll: number;
    squashY: number;
    stunTimer: number;
    stumbleTimer?: number;
    stumbleTwist?: number;
    isKnockedDown: boolean;
    knockdownBlend: number;
    hitFlashTimer: number;
    punchesRemaining: number;
    punchSequenceCooldown: number;
    grappleTargetColor?: PlayerColor | null;
    grabbedByColor?: PlayerColor | null;
    grappleAttemptTimer?: number;
    grappleStruggleMeter?: number;
    leftHand: { reachBlend: number; grabbedPieceId: string | null; punchTimer: number };
    rightHand: { reachBlend: number; grabbedPieceId: string | null; punchTimer: number };
  },
  time: number,
): void {
  const punchesAvailable = state.punchesRemaining > 0 && state.punchSequenceCooldown <= 0;
  rig.leftGlove.visible = true;
  rig.rightGlove.visible = true;
  if (punchesAvailable) {
    rig.gloveBodyMat.color.setHex(0xdc2626);
    rig.gloveBodyMat.emissive.setHex(0x3b0707);
    rig.gloveBodyMat.roughness = 0.34;
    rig.gloveBodyMat.clearcoat = 0.35;
    rig.gloveCuffMat.color.setHex(0xf8fafc);
  } else {
    rig.gloveBodyMat.color.setHex(0x64748b);
    rig.gloveBodyMat.emissive.setHex(0x0f172a);
    rig.gloveBodyMat.roughness = 0.78;
    rig.gloveBodyMat.clearcoat = 0.05;
    rig.gloveCuffMat.color.setHex(0x94a3b8);
  }

  const kd = Math.max(0, Math.min(1, state.knockdownBlend));
  const isGrabbingOpponent = Boolean(state.grappleTargetColor);
  const isGrabbed = Boolean(state.grabbedByColor);
  const isAttemptingGrapple = (state.grappleAttemptTimer ?? 0) > 0;
  const stunned = state.stunTimer > 0 || (state.stumbleTimer ?? 0) > 0;

  rig.root.position.set(state.x, 0, state.z);
  rig.bodyPivot.position.y = state.y + kd * 0.42;
  rig.bodyPivot.rotation.y = state.yaw;
  // Backward ragdoll topple onto the chessboard when knocked down
  rig.bodyPivot.rotation.x = -kd * (Math.PI * 0.46);
  rig.bodyPivot.rotation.z = kd * Math.sin(time * 9.0) * 0.14;

  // Squash & stretch (preserve volume roughly)
  const invSq = 1 / Math.sqrt(Math.max(0.5, state.squashY));
  rig.bodyPivot.scale.set(invSq, state.squashY, invSq);

  // Contact shadow shrinks softly as character jumps higher (and widens slightly when knocked down)
  const heightFactor = Math.max(0.45, 1 - state.y * 0.14) * (1 + kd * 0.45);
  rig.shadowDisc.scale.setScalar(0.95 * heightFactor);

  const strideAmp = Math.min(1, state.speedRatio);
  const walkBob = Math.abs(Math.sin(state.walkCycle)) * 0.085 * strideAmp * (1 - kd);
  const idleBreath = Math.sin(time * 2.4 + (state.yaw > 1 ? 0 : 1.5)) * 0.025;

  // Compute punch curve (0..1) for left and right hands
  const computePunchDrive = (punchTimer: number): { windup: number; thrust: number } => {
    if (punchTimer <= 0) return { windup: 0, thrust: 0 };
    if (punchTimer > PUNCH_WINDUP_END) {
      const t = (PUNCH_DURATION - punchTimer) / Math.max(0.001, PUNCH_DURATION - PUNCH_WINDUP_END);
      return { windup: Math.sin(t * Math.PI * 0.5), thrust: 0 };
    }
    if (punchTimer > PUNCH_ACTIVE_END) {
      const t = 1 - (punchTimer - PUNCH_ACTIVE_END) / Math.max(0.001, PUNCH_WINDUP_END - PUNCH_ACTIVE_END);
      return { windup: 0, thrust: Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.5) };
    }
    const t = punchTimer / Math.max(0.001, PUNCH_ACTIVE_END);
    return { windup: 0, thrust: t * 0.85 };
  };

  const leftPunch = computePunchDrive(state.leftHand.punchTimer);
  const rightPunch = computePunchDrive(state.rightHand.punchTimer);
  const punchTorsoTwist =
    (rightPunch.thrust - leftPunch.thrust) * 0.42 - (rightPunch.windup - leftPunch.windup) * 0.25;

  const struggleIntensity = isGrabbed ? 0.65 + (state.grappleStruggleMeter ?? 0) * 0.65 : 0;
  const stunWobble = stunned
    ? Math.sin(time * 18.0) * 0.18
    : isGrabbed
      ? Math.sin(time * 16.0) * 0.14 * struggleIntensity
      : 0;
  const dragLean = isGrabbingOpponent ? -0.14 - strideAmp * 0.12 : 0;

  rig.pelvis.position.y = 1.05 + walkBob - (isGrabbed ? 0.04 : 0);
  rig.pelvis.rotation.x = state.leanPitch * 0.4 + dragLean * 0.4;
  rig.pelvis.rotation.z = state.leanRoll * 0.5 + stunWobble * 0.4;

  rig.torso.rotation.x =
    state.leanPitch +
    dragLean +
    idleBreath * 0.4 +
    (leftPunch.thrust + rightPunch.thrust) * 0.16 +
    (isAttemptingGrapple ? 0.22 : 0);
  rig.torso.rotation.y =
    punchTorsoTwist +
    (state.stumbleTwist ?? 0) +
    (isGrabbed ? Math.sin(time * 13.0) * 0.24 * struggleIntensity : 0);
  rig.torso.rotation.z = state.leanRoll + Math.sin(state.walkCycle) * 0.06 * strideAmp + stunWobble;

  rig.head.rotation.x =
    -state.leanPitch * 0.35 +
    Math.sin(time * 1.8) * 0.04 +
    (stunned ? -0.35 + Math.sin(time * 14) * 0.15 : isGrabbed ? -0.22 + Math.sin(time * 15) * 0.12 : 0);
  rig.head.rotation.y = -punchTorsoTwist * 0.6;

  // Legs: walk stride, airborne tuck, struggling brace, or stunned flail
  const legSwing = Math.sin(state.walkCycle) * 0.68 * strideAmp;
  const airLeg = !state.grounded ? -0.35 : 0;
  const flailLeg = stunned
    ? Math.sin(time * 15) * 0.45
    : isGrabbed
      ? Math.sin(time * 17) * 0.38
      : 0;
  rig.leftHip.rotation.x = legSwing + airLeg + flailLeg + (isGrabbingOpponent ? -0.16 : 0);
  rig.leftHip.rotation.z = 0.06 + kd * 0.24 + (isGrabbed ? 0.14 : 0);

  rig.rightHip.rotation.x = -legSwing - airLeg * 0.5 - flailLeg + (isGrabbingOpponent ? 0.14 : 0);
  rig.rightHip.rotation.z = -0.06 - kd * 0.24 - (isGrabbed ? 0.14 : 0);

  // Arms: independent reaching, carrying, punching, grappling, struggling, or stunned flailing
  const armWalk = Math.sin(state.walkCycle) * 0.55 * strideAmp;

  const animateArm = (
    shoulder: THREE.Group,
    upper: THREE.Group,
    elbow: THREE.Group,
    handMesh: THREE.Mesh,
    reachBlend: number,
    grabbing: boolean,
    punch: { windup: number; thrust: number },
    sideSign: number,
    walkSwing: number,
  ) => {
    if (isGrabbingOpponent) {
      // Arms locked forward and slightly inward clamping onto opponent's shoulders
      shoulder.rotation.x = -1.48 + Math.sin(time * 8 + sideSign) * 0.05;
      shoulder.rotation.z = sideSign * -0.18;
      upper.rotation.y = sideSign * -0.28;
      elbow.rotation.x = -0.44;
      handMesh.scale.setScalar(1.24);
      return;
    }

    if (isAttemptingGrapple) {
      // Wide open grabbing lunge with both hands
      shoulder.rotation.x = -1.56;
      shoulder.rotation.z = sideSign * 0.24;
      upper.rotation.y = sideSign * 0.12;
      elbow.rotation.x = -0.18;
      handMesh.scale.setScalar(1.2);
      return;
    }

    if (isGrabbed && !grabbing) {
      // Victim arms pushing/flailing to break free
      const pushOsc = Math.sin(time * 15 + sideSign * 1.6);
      shoulder.rotation.x = -1.05 + pushOsc * 0.38;
      shoulder.rotation.z = sideSign * (0.36 + Math.cos(time * 12) * 0.2);
      upper.rotation.y = sideSign * 0.18;
      elbow.rotation.x = -0.55 + pushOsc * 0.25;
      handMesh.scale.setScalar(1.05);
      return;
    }

    if (stunned) {
      const flail = Math.sin(time * 16 + sideSign * 1.4);
      shoulder.rotation.x = -0.85 + flail * 0.55;
      shoulder.rotation.z = sideSign * (0.65 + Math.cos(time * 13) * 0.28);
      upper.rotation.y = 0;
      elbow.rotation.x = -0.45 + flail * 0.25;
      handMesh.scale.setScalar(1.0);
      return;
    }

    if (punch.windup > 0 || punch.thrust > 0) {
      // Windup pulls fist back by torso; active thrust snaps straight forward toward opponent
      const pitch = punch.windup > 0 ? 0.55 * punch.windup : -1.62 * punch.thrust;
      shoulder.rotation.x = pitch;
      shoulder.rotation.z = sideSign * (0.22 * (1 - punch.thrust) - 0.18 * punch.thrust);
      upper.rotation.y = sideSign * (-0.25 * punch.thrust);
      elbow.rotation.x = punch.windup > 0 ? -1.45 * punch.windup : -0.08;
      handMesh.scale.setScalar(1.0 + punch.thrust * 0.34);
      return;
    }

    // Base idle/walk pose vs forward reach (-PI/2 rotates -Y limb forward toward +Z!)
    const restPitch = walkSwing;
    const reachPitch = grabbing ? -1.42 : -1.52;
    const targetPitch = restPitch * (1 - reachBlend) + reachPitch * reachBlend;

    shoulder.rotation.x = targetPitch;
    shoulder.rotation.z = sideSign * (0.18 * (1 - reachBlend) + (grabbing ? -0.14 : 0.04) * reachBlend);
    upper.rotation.y = sideSign * (grabbing ? -0.22 : 0.0) * reachBlend;
    elbow.rotation.x = -0.28 * (1 - reachBlend) - (grabbing ? 0.38 : 0.12) * reachBlend;

    const handScale = grabbing ? 1.24 : 1.0 + reachBlend * 0.12;
    handMesh.scale.setScalar(handScale);
  };

  animateArm(
    rig.leftShoulder,
    rig.leftUpperArm,
    rig.leftElbow,
    rig.leftHandMesh,
    state.leftHand.reachBlend,
    Boolean(state.leftHand.grabbedPieceId),
    leftPunch,
    1,
    -armWalk,
  );
  animateArm(
    rig.rightShoulder,
    rig.rightUpperArm,
    rig.rightElbow,
    rig.rightHandMesh,
    state.rightHand.reachBlend,
    Boolean(state.rightHand.grabbedPieceId),
    rightPunch,
    -1,
    armWalk,
  );
}
