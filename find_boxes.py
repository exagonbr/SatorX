from PIL import Image

def find_panels(img_path):
    img = Image.open(img_path).convert("L")  # Grayscale
    pixels = img.load()
    w, h = img.size
    
    # We want to find the 4 largest horizontal/vertical line boundaries
    # Actually, simpler: just find the bounding box of pixels that are non-black
    # Wait, the lines are gold, the background is black, the images themselves have many colors.
    # Let's save a thresholded version to see the lines.
    
    threshold = 50
    out = Image.new("1", (w, h))
    for y in range(h):
        for x in range(w):
            out.putpixel((x, y), 255 if pixels[x, y] > threshold else 0)
    out.save("thresh.png")

if __name__ == "__main__":
    find_panels("/home/jade/.cursor/projects/home-jade-Projetos-sator-engine-node/assets/7569e636-3bed-4547-9bed-1ff67fc39b3c-72590700-8861-4e2d-a5ad-f91ed0f388d9.png")
