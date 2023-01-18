import Head from "next/head";
import Image from "next/image";
import { Inter, Poppins } from "@next/font/google";
import "tailwindcss/tailwind.css";
import { useRef, useEffect, useState, useMemo } from "react";
import { BiCopy } from "react-icons/bi";
import { FcApproval, FcCancel } from "react-icons/fc";
import { FiInfo } from "react-icons/fi";
import moment from "moment";

const inter = Inter({ subsets: ["latin"], variable: "--inter-font" });
const poppins = Poppins({
  weight: "400",
  variable: "--poppins-font",
  subsets: ["latin"],
});

export default function Home() {
  let interval;
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
  const [logoSize, setLogoSize] = useState(80);
  const [uploading, setUploading] = useState(false);
  const [clipboardMessage, setClipboardMessage] = useState();
  const [cloudinaryData, setCloudinaryData] = useState([]);
  const dropAreaRef = useRef();
  const bodyAreaRef = useRef();

  const message = useMemo(() => {
    if (imageData.length == 0 && unwanted == 0) {
      return "";
    } else if (imageData.length && unwanted < 1) {
      return `You selected ${imageData.length} ${
        imageData.length > 1 ? "images" : "image"
      }.`;
    } else {
      return `You selected ${imageData.length > 0 ? imageData.length : "no"} ${
        imageData.length <= 1 ? "file" : "files"
      } that ${imageData.length > 1 ? "match" : "matches"} the accepted file ${
        imageData.length > 1 ? "formats" : "format"
      } and ${unwanted} invalid file ${unwanted > 1 ? "formats" : "format"}.`;
    }
  }, [unwanted, imageData]);

  const handleChange = (e) => {
    setImageURIS([]);
    const object = e.target.files;
    for (const fileObj of object) {
      setImageURIS((prev) => [...prev, fileObj]);
    }
  };
  const handleDrop = (e, self) => {
    let filesArr = [];
    let unwantedFilesQuantity = 0;
    setUnwanted(0);
    setImageData([]);

    // reset border color

    if (
      self.classList.contains("border-green-500") ||
      self.classList.contains("border-orange-500")
    ) {
      self.classList.replace("border-green-500", "border-slate-500");
      self.classList.replace("border-orange-500", "border-slate-500");
    }

    const files = e.dataTransfer.files;
    for (const file in files) {
      if (Object.hasOwnProperty.call(files, file)) {
        const element = files[file];
        acceptedFormats.includes(files[file]["type"])
          ? filesArr.push(files[file])
          : (unwantedFilesQuantity = unwantedFilesQuantity + 1);
      }
    }
    setUnwanted(unwantedFilesQuantity);

    // Dynamically set border color base on selcted files and formats
    filesArr.length && unwantedFilesQuantity < 1
      ? (setImageURIS(filesArr),
        self.classList.replace("border-slate-500", "border-green-500"))
      : (setImageURIS(filesArr),
        self.classList.replace("border-slate-500", "border-orange-500"));
  };
  const handleUpload = async () => {
    setUploading(true);

    try {
      const data = await fetch("/api/cloudinary", {
        method: "POST",
        body: JSON.stringify({ images: imageData }),
        headers: {
          contentType: "application/json",
        },
      });

      console.log(data);

      if (data.ok && data.status === 200) {
        const response = await data.json();
        console.log(response);

        setUploading(false);
        setImageURIS([]);
        setImageData([]);
        setCloudinaryData((prev) => [...response.result, ...prev]);
        setClipboardMessage({
          type: "success",
          message: `Uploaded ${imageData.length} ${
            imageData.length > 1 ? "images" : "image"
          } successfully. `,
        });
        setUnwanted(0);

        // reset border color
        dropAreaRef.current.classList.contains("border-green-500");
        dropAreaRef.current.classList.contains("border-orange-500");

        interval = setTimeout(() => setClipboardMessage(), 5000);
      } else if (!data.ok && data.status === 413) {
        setUploading(false);
        setImageURIS([]);
        setImageData([]);
        setClipboardMessage({
          type: "error",
          message: `Upload exceeds 4MB. `,
        });
        setUnwanted(0);

        // reset border color
        dropAreaRef.current.classList.contains("border-green-500");
        dropAreaRef.current.classList.contains("border-orange-500");

        interval = setTimeout(() => setClipboardMessage(), 5000);
        return;
      } else {
        console.log(response);

        setUploading(false);
        setImageURIS([]);
        setImageData([]);
        setClipboardMessage({
          type: "error",
          message: `Couldn't upload ${
            imageData.length > 1 ? "images" : "image"
          } at the moment. Please check your network and try again. `,
        });
        setUnwanted(0);

        // reset border color
        dropAreaRef.current.classList.contains("border-green-500");
        dropAreaRef.current.classList.contains("border-orange-500");

        interval = setTimeout(() => setClipboardMessage(), 5000);
      }
    } catch (error) {
      console.log(error);
      setUploading(false);
      setClipboardMessage({
        type: "error",
        message: `Couldn't upload ${
          imageData.length > 1 ? "images" : "image"
        } at the moment. Please check your network and try again. `,
      });
      interval = setTimeout(() => setClipboardMessage(), 5000);
    }
  };
  const handleCopy = async (url) => {
    if (interval) clearInterval(interval);
    setClipboardMessage();

    try {
      const result = await navigator.clipboard.writeText(url);
      setClipboardMessage({
        type: "success",
        message: "Image URL copied successfully.",
      });
    } catch (error) {
      setClipboardMessage({
        type: "error",
        message: "Couldn't copy image URL.",
      });
    }

    interval = setTimeout(() => setClipboardMessage(), 5000);
  };

  useEffect(() => {
    let dropArea = dropAreaRef.current;
    let bodyRef = bodyAreaRef.current;

    dropArea.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.replace("border-slate-500", "border-slate-500");
      this.classList.replace("border-2", "border-4");
    });

    dropArea.addEventListener("dragleave", function (e) {
      this.classList.replace("border-green-500", "border-slate-500");
      this.classList.replace("border-4", "border-2");
    });

    dropArea.addEventListener("drop", function (e) {
      const self = this;
      e.preventDefault();
      handleDrop(e, self);
    });

    bodyRef.addEventListener("dragover", function (e) {
      e.preventDefault();
      this.classList.replace("border-slate-500", "border-slate-500");
      this.classList.replace("border-2", "border-4");
    });

    bodyRef.addEventListener("dragleave", function (e) {
      e.preventDefault();
      this.classList.replace("border-green-500", "border-slate-500");
      this.classList.replace("border-4", "border-2");
    });

    bodyRef.addEventListener("drop", function (e) {
      e.preventDefault();
      const self = dropArea;
      handleDrop(e, self);
    });

    window.onresize = () => {
      if (window.innerWidth < 480) {
        return setLogoSize(35);
      }
      if (window.innerWidth > 480 && window.innerWidth < 768) {
        return setLogoSize(50);
      }
      if (window.innerWidth > 768 && window.innerWidth < 1440) {
        return setLogoSize(80);
      }
      if (window.innerWidth > 768 && window.innerWidth < 1440) {
        return setLogoSize(100);
      }
    };

    return () => {
      dropArea.removeEventListener("dragover", function (e) {
        e.preventDefault();
        this.classList.replace("border-slate-500", "border-green-500");
        this.classList.replace("border-2", "border-4");
      });
      dropArea.removeEventListener("dragleave", function (e) {
        e.preventDefault();
        this.classList.replace("border-green-500", "border-slate-500");
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
      <main ref={bodyAreaRef} className={poppins.variable}>
        <header className="bg-gradient-to-r from-violet-200 to-pink-200 sticky top-0 z-10 shadow-lg">
          <Image
            src="/JA_logo.png"
            alt="logo"
            width={logoSize}
            height={logoSize}
            className="absolute top-[50%] -translate-y-[50%] brightness-0"
            quality={100}
          />
          <h1 className="text-xl text-center px-3 py-3 font-secondary relative z-10 sm:text-xl md:text-5xl">
            Image URL Generator
          </h1>
        </header>

        <section className="sm:w-full md:container md:w-full lg:w-7/12 xl:w-5/12 mx-auto px-3 relative z-0">
          {clipboardMessage?.message && (
            <div
              className={`${
                clipboardMessage.type == "success"
                  ? "bg-green-100"
                  : "bg-red-100"
              } fixed right-4 bottom-4 rounded-md p-2 overflow-hidden shadow-lg after:block after:w-full after:absolute after:top-0 after:left-0 after:h-1 ${
                clipboardMessage.type == "success"
                  ? "after:bg-green-600"
                  : "after:bg-red-600"
              } after:rounded-sm after:animate-width`}
            >
              <p className=" flex gap-2 items-center">
                {clipboardMessage.type == "success" ? (
                  <FcApproval />
                ) : (
                  <FcCancel />
                )}
                <span>{clipboardMessage.message}</span>
              </p>
            </div>
          )}
          <p className="text-center py-7 font-primary">
            Select image from your gallery by clicking on button below or drag
            and drop images and we will get you a URL(s) that for your image(s).
          </p>
          <div
            ref={dropAreaRef}
            className={`${
              imageData.length && "py-5"
            } rounded-xl overflow-hidden relative z-10 border-dashed border-2 border-slate-500 transition-all ease-in-out duration-300 flex justify-around flex-wrap flex-row gap-5`}
          >
            {imageData.length >= 1 ? (
              imageData.map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  alt="image"
                  width={window.innerWidth / 4 > 300 ? 200 : 150}
                  height={window.innerWidth / 4 > 300 ? 200 : 150}
                  className="aspect-auto rounded-lg shadow-2xl"
                />
              ))
            ) : (
              <>
                <div className="relative flex justify-center top-0 left-0 w-full h-fit z-10 bg-gradient-to-r from-violet-200 to-pink-200 p-10 transition-all ease-in-out duration-300">
                  <Image
                    width={100}
                    height={100}
                    className="w-9/12 h-fit object-cover"
                    alt=""
                    src="/images.svg"
                    priority={true}
                  />
                </div>
              </>
            )}
          </div>
          <p className="flex gap-1 items-center mt-1 mb-5">
            <FiInfo className="text-slate-800" />
            <small className="text-slate-800">
              Upload cannot be more than 4MB.
            </small>
          </p>
          <input
            type="file"
            id="select"
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleChange}
          />
          <p className="mt-3">{message}</p>
          {imageData.length >= 1 && <p>Click upload button to continue.</p>}
          <div className="flex justify-between gap-3 flex-wrap">
            <label
              htmlFor="select"
              className=" block bg-gradient-to-r from-violet-200 to-pink-200 my-4  w-fit px-7 py-5 rounded-xl transition-all duration-300 hover:hue-rotate-180 hover:scale-105 cursor-pointer"
            >
              Select Image(s)
            </label>
            <button
              disabled={uploading}
              onClick={handleUpload}
              className={
                imageData.length
                  ? `${
                      uploading && "pointer-events-none cursor-not-allowed"
                    } opacity-100 pointer-events-auto block bg-gradient-to-r from-violet-200 to-pink-200 my-4  w-fit px-7 py-5 rounded-xl transition-all duration-300 hover:hue-rotate-180 hover:scale-105 cursor-pointer`
                  : "opacity-0 pointer-events-none block bg-gradient-to-r from-violet-200 to-pink-200 my-4  w-fit px-7 py-5 rounded-xl transition-all duration-300 hover:hue-rotate-180 hover:scale-105 cursor-pointer"
              }
            >
              {uploading ? (
                <div className="flex justify-around content-center gap-2">
                  <div
                    className="pointer-events-none
                            cursor-not-allowed
                            spinner-border
                            animate-spin
                            inline-block
                            w-6
                            h-6
                            border-4
                            border-r-transparent
                            rounded-full
                            fill-green-400
                            border-fuchsia-400
                            text-purple-500
                          "
                    role="status"
                  ></div>
                  <span>Uploading</span>
                </div>
              ) : (
                "Upload"
              )}
            </button>
          </div>
          <div className="w-full px-2 pt-4 pb-7 shadow-inner rounded-xl relative z-10 mb-6 backdrop-brightness-95">
            <h1 className="text-3xl text-center px-3 py-3 font-secondary z-10 sticky top-16 mb-2 backdrop-blur backdrop-brightness-150 rounded-lg">
              Uploaded Images
            </h1>
            {cloudinaryData.length > 0 ? (
              cloudinaryData.map((image) => (
                <div
                  key={image.asset_id}
                  className="relative flex justify-between items-start w-full mb-3 bg-white border-slate-100 border rounded-md shadow-md hover:shadow-xl duration-200 ease-in-out overflow-hidden"
                >
                  <Image
                    src={image.secure_url}
                    alt={image.resource_type}
                    width={window.innerWidth / 4 > 300 ? 200 : 150}
                    height={window.innerWidth / 4 > 300 ? 200 : 150}
                    className="rounded-md border-slate-200 border shadow-md"
                    placeholder="blur"
                    blurDataURL="/loading-image.gif"
                  />
                  <button
                    title="Copy URL"
                    className="flex gap-1 items-center absolute right-0 top-0 bg-white p-2 hover:shadow-lg hover:bg-pink-200 duration-200 ease rounded-bl-md"
                    onClick={() => handleCopy(image.secure_url)}
                  >
                    <span>Copy URL</span>
                    <BiCopy />
                  </button>

                  <p className="block absolute right-0 bottom-0 p-1 rounded-tl-md text-slate-400 bg-white">
                    {moment(image.created_at).fromNow()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center">
                You have not uploaded any images yet.
              </p>
            )}
          </div>

          {cloudinaryData.length > 0 && (
            <button
              onClick={() => setCloudinaryData([])}
              className="block bg-gradient-to-r from-violet-200 to-pink-200 my-4  w-full px-7 py-5 rounded-xl transition-all duration-300 hover:hue-rotate-180 hover:scale-105 cursor-pointer"
            >
              Clear Uploaded Images
            </button>
          )}
        </section>
      </main>
    </>
  );
}
