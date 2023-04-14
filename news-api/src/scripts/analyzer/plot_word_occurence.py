import csv
import matplotlib.pyplot as plt
import sys

FILE = sys.argv[1]

def main():
    x = []
    y = []
    
    with open(FILE, "r") as f:
        plots = csv.reader(f, delimiter=",")
        
        for row in plots:
            try:
                if (row[0] != ""):
                    if (row[0].find("'") == -1):
                        x.append(row[0])
                    else:
                        x.append(row[0].split("'")[1] + " " + row[0].split("'")[3])
                    y.append(int(row[1]))
                else:
                    continue
            except:
                continue
    
    # reverse the lists
    x = x[::-1]
    y = y[::-1]
    
    plt.barh(
        x,
        y,
        color="blue"
    )
    plt.xlabel("Occurences")
    plt.ylabel("Word")
    plt.title(FILE.split("/")[-1])
    plt.grid(True, axis="x")
    plt.show()


if __name__ == "__main__":
    main()