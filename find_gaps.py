import sys
from PIL import Image

def find_gaps(img_path):
    img = Image.open(img_path).convert("RGB")
    w, h = img.size
    
    # row sums of non-black pixels
    row_sums = []
    for y in range(h):
        s = sum(1 for x in range(w) if sum(img.getpixel((x, y))) > 30)
        row_sums.append(s)
        
    # col sums of non-black pixels
    col_sums = []
    for x in range(w):
        s = sum(1 for y in range(h) if sum(img.getpixel((x, y))) > 30)
        col_sums.append(s)
        
    print("Row sum > 10 at:")
    start = -1
    for y in range(h):
        if row_sums[y] > 10 and start == -1:
            start = y
        elif row_sums[y] <= 10 and start != -1:
            print(f"y: {start} -> {y-1} (height {y-start})")
            start = -1
    if start != -1:
        print(f"y: {start} -> {h-1} (height {h-start})")

    print("Col sum > 10 at:")
    start = -1
    for x in range(w):
        if col_sums[x] > 10 and start == -1:
            start = x
        elif col_sums[x] <= 10 and start != -1:
            print(f"x: {start} -> {x-1} (width {x-start})")
            start = -1
    if start != -1:
        print(f"x: {start} -> {w-1} (width {w-start})")

if __name__ == "__main__":
    find_gaps(sys.argv[1])
