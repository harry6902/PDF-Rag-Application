"use client"

import { ChangeEvent, useState, useRef } from "react";
import axios from "axios";
export default function Home() {


  const [fileUploaded,setFileUploaded]= useState(false);
  const [loader,setLoader]=useState(false);
  const fileRef= useRef<HTMLInputElement>(null)
  const [question,setQuestion]= useState("");
  const [showAnswer,setShowAnswer]= useState(false);
  const [answer,setAnswer]= useState("");
  const [loader2,setLoader2]= useState(false);
  function handleUploadFile(){
 
    if(!fileRef.current){
      return;
    }
    fileRef.current.click()
    
  }

  async function handleSubmit(){
    setLoader2(true);
    const response= await axios.post("http://localhost:5000/query",{
      question:question
    }
  )
    setAnswer(response.data.answer);

  setLoader2(false);
  setShowAnswer(true);

  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>){
    setLoader(true);
    const files=e.target.files;
    if(!files){
      return;
    }
    const file=files[0];
    const formData= new FormData();
    formData.append("file",file);

    const response= await axios.post("http://localhost:5000/upload",formData);

    console.log(response.data);
    setFileUploaded(true);
    setLoader(false);


  

  }

  return (
  <div className="flex flex-col gap-10 justify-center items-center h-screen">

    <input ref={fileRef} onChange={(e)=>handleFile(e)} className="hidden" type="file" name="file" id="actualbutton" />
    <div  onClick={handleUploadFile}  className="flex justify-center items-center gap-4 cursor-pointer" id="proxybutton">
    <div className="h-12 w-12">
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
    <div className="font-bold">
      File Uploaded Successfully!!! Ask Your questions
      </div>
   }
   {(loader) &&
   <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin">

   </div>
    
   }

  
  </div>
  <div>
  {
    (!loader && fileUploaded) &&

    <div>
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
   <div>
    {(loader2) && 

    <div className="h-6 w-6 border-3 border-white border-t-transparent rounded-full animate-spin">

    </div>

    }
    {(showAnswer && !loader2)&&
    <div className="w-[40vw]">
      {answer}

    </div>
      
    }
   </div>

  </div>
  );
}
