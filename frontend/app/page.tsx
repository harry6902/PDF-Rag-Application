"use client"

import { ChangeEvent, useState, useRef, useEffect } from "react";
import axios from "axios";

interface MessageType{
  role:"user" | "assistant";
  message: string
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
  
  useEffect(() => {
      
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
    const response= await fetch("http://localhost:5000/query",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({question})
    })

    const reader=response.body?.getReader();
    const decoder= new TextDecoder();
    let result="";
    while(true){
      const {done,value}=await reader!.read();
      if(done)break;
      const chunk=decoder.decode(value);
      result+=chunk;
      setMessages((prev)=>{
        const last= prev[prev.length-1];
        if(last?.role==="assistant"){
          last.message=result;
          return [...prev];
        }
        return [...prev,{role:"assistant",message:result}]
      })
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
   
    const formData= new FormData();
  for(const file of files){
    formData.append("files",file);
  }
   

    const response= await axios.post("http://localhost:5000/upload",formData);
    setFileUploaded(true);
    setLoader(false);


  

  }

  return (
  <div className="flex flex-col gap-10 items-center">

    <input ref={fileRef} multiple onChange={(e)=>handleFile(e)} className="hidden" type="file" name="file" id="actualbutton" />
    <div  onClick={handleUploadFile}  className={"flex justify-center items-center gap-4 cursor-pointer mt-[20vh]"} id="proxybutton">
    <div className={"h-12 w-12"+(fileUploaded  ? 'mt-[-20vh]':'')}>
    <svg viewBox="0 0 24 24" fill="white">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM13 9V3.5L18.5 9H13Z"/>
  </svg>
  </div>
    {(!loader && !fileUploaded) &&
    <div className="font-bold">
      Click here to upload File
      </div>
   }
   {(!loader && fileUploaded) &&
    <div className="font-bold mt-[-30vh]">
      File Uploaded Successfully!!! Ask Your questions
      </div>
   }
   {(loader) &&
   <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin">

   </div>
    
   }

  
  </div>
  <div>

   </div>
   <div    className="h-screen flex  flex-col px-6 py-6 pb-[20vh]  gap-2 mt-[-15vh]">
    
    {(messages.length>0)&&
    <div className="w-[40vw] overflow-y-auto no-scrollbar flex-1  pb-10 ">
      
      {
        messages.map((item,index)=>(
          <div key={index}>
            <p className={`w-fit px-4 py-2 rounded-lg 
  ${item.role==="user" ? "bg-gray-700 ml-auto" : ""}
`}>
  {item.message}
</p>
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
   
    
      
    }
  

  <div className="fixed bottom-10 left-0 w-full flex justify-center">
   
  </div>
   </div>

   {
    (!loader && fileUploaded) &&

    <div className="fixed bottom-10 left-0 w-full flex justify-center">
      <input className="text-gray-300 bg-gray-700 w-[30vw] h-10 p-3"
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
