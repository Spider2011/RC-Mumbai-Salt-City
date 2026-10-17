"""Builds the low-poly origami paper boat used on the homepage and exports a GLB.

Run headless from the repo root:
  "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background --factory-startup \
      --python scripts/blender/paper-boat.py -- public/models/paper-boat.glb
"""

import sys
import bpy

out = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "public/models/paper-boat.glb"

bpy.ops.wm.read_factory_settings(use_empty=True)

# Blender is Z-up; the glTF exporter converts to Y-up. Length runs along X.
RIM_Z, HALF_BEAM, KEEL_HALF, TIP_X = 0.45, 0.32, 0.55, 1.0
verts = [
    (-KEEL_HALF, 0, 0), (KEEL_HALF, 0, 0),                        # 0-1 keel
    (-TIP_X, 0, RIM_Z), (TIP_X, 0, RIM_Z),                         # 2-3 bow / stern tips
    (-KEEL_HALF, HALF_BEAM, RIM_Z), (KEEL_HALF, HALF_BEAM, RIM_Z),  # 4-5 port rim
    (-KEEL_HALF, -HALF_BEAM, RIM_Z), (KEEL_HALF, -HALF_BEAM, RIM_Z),  # 6-7 starboard rim
    (-KEEL_HALF, 0.05, RIM_Z), (KEEL_HALF, 0.05, RIM_Z),            # 8-9 sail base, port layer
    (-KEEL_HALF, -0.05, RIM_Z), (KEEL_HALF, -0.05, RIM_Z),          # 10-11 sail base, starboard layer
    (0, 0, 1.15),                                                  # 12 sail apex
]
faces = [
    (0, 1, 5, 4), (2, 0, 4), (1, 3, 5),   # port hull wall
    (1, 0, 6, 7), (0, 2, 6), (3, 1, 7),   # starboard hull wall
    (8, 9, 12), (11, 10, 12),             # the two folded layers of the sail
    (10, 8, 12), (9, 11, 12),             # sail edges, closing the fold
]

mesh = bpy.data.meshes.new("PaperBoat")
mesh.from_pydata(verts, [], faces)
mesh.update()
for poly in mesh.polygons:
    poly.use_smooth = False  # crisp folds

mat = bpy.data.materials.new("Paper")
mat.use_backface_culling = False  # exported as doubleSided: the hull is open on top
bsdf = mat.node_tree.nodes.get("Principled BSDF") if mat.node_tree else None
if bsdf:
    bsdf.inputs["Base Color"].default_value = (0.95, 0.92, 0.86, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.85
mesh.materials.append(mat)

obj = bpy.data.objects.new("PaperBoat", mesh)
bpy.context.scene.collection.objects.link(obj)

bpy.ops.export_scene.gltf(filepath=out, export_format="GLB", export_yup=True)
print(f"EXPORTED {out}")
