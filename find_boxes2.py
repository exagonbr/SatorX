from PIL import Image

def find_boxes(img_path):
    img = Image.open(img_path).convert("L")
    w, h = img.size
    
    # scan horizontal lines to see where content is
    row_intensity = [sum(img.getpixel((x, y)) for x in range(w)) for y in range(h)]
    col_intensity = [sum(img.getpixel((x, y)) for y in range(h)) for x in range(w)]
    
    print("row_intensity snippet:")
    for y in range(0, h, 10):
        print(f"y={y}: {row_intensity[y]}")
        
    print("col_intensity snippet:")
    for x in range(0, w, 10):
        print(f"x={x}: {col_intensity[x]}")

if __name__ == "__main__":
    find_boxes("/home/jade/.cursor/projects/home-jade-Projetos-sator-engine-node/assets/7569e636-3bed-4547-9bed-1ff67fc39b3c-72590700-8861-4e2d-a5ad-f91ed0f388d9.png")
