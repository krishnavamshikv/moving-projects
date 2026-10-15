def main():
   filename = input("File name: ")

   filetype = filename.split(".")[-1].lower()

   match filetype:
      case "gif" | "png": 
         print(f"image/{filetype}")
      case "jpg" | "jpeg":
         print("image/jpeg")
      case "pdf" | "zip":
         print(f"application/{filetype}")
      case "txt":
         print("text/plain")
      case _:
         print("application/octet-stream")

main()