"use client"

import { ChangeEvent, useState, useRef, useEffect } from "react";
import axios from "axios";
import {v4 as uuidv4} from "uuid";

interface MessageType{
  role:"user" | "assistant";
  message: string;
  source?: Sources
}
interface Sources{
    fileName: string;
    page:number
}

interface FileType{
  fileName: string;
  fileId:string
}
export default function Home() {


  const [fileUploaded,setFileUploaded]= useState(false);
  const [loader,setLoader]=useState(false);
  const fileRef= useRef<HTMLInputElement>(null);
  const messagesRef=useRef<HTMLDivElement>(null);
  const [question,setQuestion]= useState("");
  const [showAnswer,setShowAnswer]= useState(false);
  const [answer,setAnswer]= useState("");
  const [loader2,setLoader2]= useState(false);
  const [messages,setMessages]= useState<MessageType[]>([]);
  const [filenames,setFileNames]=useState<FileType[]>([]);
  const [selectedFile,setSelectedFile]= useState<FileType>();
  
  
  useEffect(() => {
    console.log(messages);
    messagesRef.current?.scrollIntoView({behavior:"smooth",block:"end"})
  }, [messages])
  
  

  function handleUploadFile(){
 
    if(!fileRef.current){
      return;
    }
    fileRef.current.click()
    
  }

  async function handleSubmit(){
    setLoader2(true);
    setMessages((prev)=>[...prev,{role:"user",message:question}]);
    setQuestion("");
    let selectedFiles:string[]=[];
    if(!selectedFile){
      for(const file of filenames){
        selectedFiles.push(file.fileId);
      }
    }
    else{
      selectedFiles=[selectedFile.fileId]
    }
    const response= await fetch(`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/query`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({question,fieldIds:selectedFiles})
    })

    const reader=response.body?.getReader();
    const decoder= new TextDecoder();
    let result="";
    let sources1:Sources={fileName:"",page:NaN};
    while(true){
      const {done,value}=await reader!.read();
      if(done)break;
      const chunk=decoder.decode(value);
      if(chunk.includes("__SOURCES__")){
        const [ans,src]=chunk.split("__SOURCES__")
          result+=ans;
        try{
          sources1=JSON.parse(src)
        }catch{}}
        else{
           result+=chunk;
        }
      // if(sources1.fileName!==""){

      
      //   setMessages((prev)=>{
      //       const last=prev[prev.length-1];
      //       last.source=sources1;
      //       return [...prev]
      //   })

      // }
      setMessages((prev)=>{
        const updated = [...prev];
      
        const last = updated[updated.length - 1];
      
        if (last?.role === "assistant") {
          updated[updated.length - 1] = {
            ...last,
            message: result,
            source: sources1
          };
          return updated;
        }
      
        return [
          ...updated,
          { role: "assistant", message: result, source: sources1 }
        ];
      });
      
      
    }
   
    // setMessages((prev)=>[...prev,{role:"assistant",message:response.data.answer}])

    // setAnswer(response.data.answer);

  setLoader2(false);
  setShowAnswer(true);
  

  
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>){
    setLoader(true);
    const files=e.target.files;
    if(!files){
      return;
    }
    console.log("DOMAIN:", process.env.NEXT_PUBLIC_BACKEND_DOMAIN);
    const formData= new FormData();
    let i=1;
  for(const file of files){
    const id=uuidv4();
    setFileNames((prev)=>([...prev,{fileName:file.name,fileId:id}]));
    formData.append("files",file);
    formData.append(`file${i}`,id);
    i++;
  }
   

    const response= await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_DOMAIN}/upload`,formData);
    setFileUploaded(true);
    setLoader(false);


  

  }

  return (
  <div className="flex flex-col gap-10 items-center">

    <input ref={fileRef} multiple onChange={(e)=>handleFile(e)} className="hidden" type="file" name="file" id="actualbutton" />
    <div   className={"flex justify-center items-center gap-4 mt-[20vh]"} id="proxybutton">
   
    {(!loader && !fileUploaded) &&
    <div onClick={handleUploadFile}  className="flex justify-center items-center gap-2 cursor-pointer">
       <input hidden ref={fileRef} multiple onChange={(e)=>handleFile(e)} className="hidden" type="file" name="file" id="actualbutton" />
       <div className={"h-12 w-12"}>
       <svg viewBox="0 0 24 24" fill="white">
       <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM13 9V3.5L18.5 9H13Z"/>
     </svg>
     </div>
    <div className="font-bold cursor-pointer">
      Click here to upload File
      </div>
      
     </div>
   }
   {(!loader && fileUploaded) &&

    // <div>File/Files Uplaoded sucessfully</div>
    <div className="flex flex-col gap-3 text-white">
         
       <div className="font-bold">
       File/Files Uploaded Successfully!!! Below are the files
       </div>

       <div>
        {
          filenames.map((item,index)=>(
            <div onClick={()=>setSelectedFile({fileId:item.fileId,fileName:item.fileName})} key={index} className={(selectedFile?.fileId===item.fileId?'bg-gray-700':'') +` p-2 flex cursor-pointer`}>
             <p>{item.fileName}</p>
            </div>
          ))
        }
       </div>
 
      </div>
   }
   {(loader) &&
   <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin">

   </div>
    
   }

  
  </div>
  <div>

   </div>
  
    
    {(messages.length>0)&&
     <div    className="flex  flex-col mx-[-10vw] w-full lg:w-fit px-2  lg:px-6 py-6 pb-[20vh] gap-2 mt-[-8vh]">
    <div className="w-full  lg:w-[40vw] overflow-y-auto no-scrollbar flex-1  pb-10 ">
      
      {
        messages.map((item,index)=>(
          <div key={index}>
            <p className={`w-fit px-4 py-2 rounded-lg 
  ${item.role==="user" ? "bg-gray-700 ml-auto" : ""}
`}>
  {item.message}
</p>
         {   item.source?.fileName.length !== undefined&&   item.source?.fileName.length >0 &&
         <div>
         <div className="w-fit px-4 py-2 rounded-lg">
         📄 {item.source.fileName} - Page{item.source.page}
         </div>
         </div>
         }
          </div>
        ))
      }
         {loader2 && (
  <div className="flex my-2">
    <div className="bg-gray-800 px-4 py-2 rounded-lg w-fit flex gap-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
    </div>
  </div>
)}
         <div className="pb-[15vh]" ref={messagesRef}></div>

    </div>
   
    
    </div> 
    }
  

  <div className="fixed bottom-10 left-0 w-full flex justify-center">
   
  </div>
   

   {
    (!loader && fileUploaded) &&

    <div className="fixed bottom-10 left-0 w-full flex justify-center">
      <input className="text-gray-300 bg-gray-700 w-[80vw] lg:w-[30vw] h-10 p-3"
      value={question}
      onKeyDown={(e)=>{
        if(e.key==="Enter"){
          handleSubmit();
        }
      }}
      onChange={(e)=>{setQuestion(e.target.value)}}
      placeholder="Ask your question here" type="text" name="" id="" />
    </div>
   }
  </div>
  );
}
