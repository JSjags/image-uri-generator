import Head from "next/head";
import Image from "next/image";
import { Inter, Poppins } from "@next/font/google";
import "tailwindcss/tailwind.css";
import { useRef, useEffect, useState, useMemo } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--inter-font" });
const poppins = Poppins({
  weight: "400",
  variable: "--poppins-font",
  subsets: ["latin"],
});

export default function Home() {
  const acceptedFormats = [
    "image/png",
    "image/jpeg",
    "image/svg+xml",
    "image/svg",
    "image/jpg",
    "image/gif",
  ];
  const [imageURIS, setImageURIS] = useState([]);
  const [imageData, setImageData] = useState([]);
  const [unwanted, setUnwanted] = useState(0);
  const dropAreaRef = useRef();
  const message = useMemo(
    () =>
      imageData.length && unwanted.length < 1
        ? `You selected ${imageData.length} ${
            imageData.length > 1 ? "images" : "image"
          }`
        : `You selected ${imageData.length > 0 ? imageData.length : "no"} ${
            imageData.length <= 1 ? "file" : "files"
          } that matches the accepted file ${
            imageData.length > 1 ? "formats" : "format"
          } and ${unwanted} invalid file ${
            imageData.length > 1 ? "formats" : "format"
          }`,
    [unwanted, imageData]
  );

  const handleChange = (e) => {
    setImageURIS([]);
    const object = e.target.files;
    for (const fileObj of object) {
      setImageURIS((prev) => [...prev, fileObj]);
    }
  };
  const handleDrop = (e, self) => {
    setUnwanted(0);
    setImageData([]);

    const files = e.dataTransfer.files;
    let filesArr = [];
    let number = 0;
    for (const file in files) {
      if (Object.hasOwnProperty.call(files, file)) {
        const element = files[file];
        acceptedFormats.includes(files[file]["type"])
          ? filesArr.push(files[file])
          : (number = number + 1);
      }
    }
    setUnwanted(number);
    alert(number);

    filesArr.length && unwanted.length < 1
      ? (setImageURIS(filesArr),
        self.classList.replace("border-slate-500", "border-green-500"))
      : (setImageURIS(filesArr),
        self.classList.replace("border-slate-500", "border-orange-500"));
  };

  useEffect(() => {
    let dropArea = dropAreaRef.current;

    dropArea.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.replace("border-slate-600", "border-slate-500");
      this.classList.replace("border-2", "border-4");
    });

    dropArea.addEventListener("dragleave", function (e) {
      this.classList.replace("border-green-600", "border-slate-600");
      this.classList.replace("border-4", "border-2");
    });

    dropArea.addEventListener("drop", function (e) {
      const self = this;
      e.preventDefault();
      handleDrop(e, self);
    });

    return () => {
      dropArea.removeEventListener("dragover", function (e) {
        e.preventDefault();
        this.classList.replace("border-slate-600", "border-green-600");
        this.classList.replace("border-2", "border-4");
      });
      dropArea.removeEventListener("dragleave", function (e) {
        e.preventDefault();
        this.classList.replace("border-green-600", "border-slate-600");
        this.classList.replace("border-4", "border-2");
      });
      dropArea.removeEventListener("drop", function (e) {
        const self = this;
        e.preventDefault();
        handleDrop(e, self);
      });
    };
  }, []);

  useEffect(() => {
    if (imageURIS.length <= 0) return;

    setImageData([]);

    imageURIS.forEach((image) => {
      const reader = new FileReader();
      let arr = [];
      reader.readAsDataURL(image);
      reader.onload = () => {
        const result = reader.result;
        arr.push(result);
        setImageData((prev) => [...new Set([...prev, result])]);
      };
    });
  }, [imageURIS]);

  return (
    <>
      <Head>
        <title>Image Uploader</title>
        <meta
          name="description"
          content="Image uploader and image URI generator"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <header className={poppins.variable}>
          <h1 className="text-5xl text-center px-3 py-3 font-secondary bg-gradient-to-r from-violet-200 to-pink-200">
            Image URI Generator
          </h1>
          <section className="sm:w-full md:container md:w-full lg:w-7/12 xl:w-5/12 mx-auto px-3">
            <p className="text-center py-7 font-primary">
              Select image from your gallery by clicking on button below or drag
              and drop images and we will get you a URI(s) that for your
              image(s).
            </p>
            <div
              ref={dropAreaRef}
              className="rounded-xl overflow-hidden relative border-dashed border-2 border-slate-500 transition-all ease-in-out duration-300 flex justify-around flex-wrap flex-row gap-5 py-5"
            >
              {imageData.length >= 1 ? (
                imageData.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt="image"
                    width={window.innerWidth / 4 > 300 ? 200 : 150}
                    height={window.innerWidth / 4 > 300 ? 200 : 150}
                    className="aspect-auto rounded-lg"
                  />
                ))
              ) : (
                <>
                  <div className="absolute top-0 left-0 w-full h-full z-10 bg-gradient-to-r from-violet-200 to-pink-200 p-20 transition-all ease-in-out duration-300">
                    <Image
                      width={100}
                      height={100}
                      className="w-full h-full"
                      alt=""
                      src="/images.svg"
                    />
                  </div>
                  <Image
                    height={300}
                    width={300}
                    className="container w-full h-max"
                    alt=""
                    src=""
                  />
                </>
              )}
            </div>
            <input
              type="file"
              id="select"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleChange}
            />
            <p>{message}</p>
            {imageData.length >= 1 && <p>Click upload button to continue.</p>}
            <div className="flex justify-between gap-3 flex-wrap">
              <label
                htmlFor="select"
                className=" block bg-gradient-to-r from-violet-200 to-pink-200 my-4  w-fit px-7 py-5 rounded-xl transition-all duration-300 hover:hue-rotate-180 hover:scale-105 cursor-pointer"
              >
                Select Image(s)
              </label>
              <label
                htmlFor="select"
                className={
                  imageData.length
                    ? "opacity-100 pointer-events-auto block bg-gradient-to-r from-violet-200 to-pink-200 my-4  w-fit px-7 py-5 rounded-xl transition-all duration-300 hover:hue-rotate-180 hover:scale-105 cursor-pointer"
                    : "opacity-0 pointer-events-none block bg-gradient-to-r from-violet-200 to-pink-200 my-4  w-fit px-7 py-5 rounded-xl transition-all duration-300 hover:hue-rotate-180 hover:scale-105 cursor-pointer"
                }
              >
                Upload Image(s)
              </label>
            </div>
          </section>
        </header>
      </main>
    </>
  );
}
