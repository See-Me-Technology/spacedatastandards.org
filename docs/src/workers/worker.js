import { flatc } from "https://digitalarsenal.io/lib/flatbuffers.js";
import WasmFs from "../lib/wasmer/wasmfs.esm.js";

const isWorker = typeof WorkerGlobalScope !== "undefined";

let fs = new WasmFs().fs;
fs.mkdirpSync("/root");
const convert = async function (e) {
  let result = {
    fileName: "",
    data: "",
    loaded: e.data.loaded,
  };

  let { currentLanguage, currentDocument, editorContents } = e.data;
  fs.writeFileSync(`/root/currentDocument.fbs`, editorContents);
  try {
    let fb = new flatc({
      fs: fs,
      rootDir: "/",
    });
    await fb.runCommand(["./flatc", currentLanguage[0], "-o", "/root", `/root/currentDocument.fbs`]);
    window.errPipe = fs.createReadStream("/dev/stderr");
    window.outPipe = fs.createReadStream("/dev/stdout");
    window.errPipe.on("data", (data) => {
      console.log(data.toString("utf8"));
    });
    window.outPipe.on("data", (data) => {
      console.log(data.toString("utf8"));
    });
    fs.readdirSync("/root/").forEach((f) => {
      if (f.slice(f.lastIndexOf(".") + 1) === currentLanguage[2]) {
        result.fileName = f;
      }
    });

    result.data = fs.readFileSync(`/root/${result.fileName}`, {
      encoding: "utf8",
    });

    result.fileName = `${currentDocument.split("/").pop().split(".")[0]}.${currentLanguage[2]}`;
  } catch (e) {
    console.log(e);
    result.data = "Code Generation Failed:  Check Syntax And Try Again.";
  }
  result.loaded = true;
  if (isWorker) {
    this.postMessage(result);
  } else {
    return result;
  }
};
if (isWorker) {
  onmessage = convert;
}

export { convert };