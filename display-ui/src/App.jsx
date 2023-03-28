import React, { useState, useEffect } from 'react';
import axios from 'axios';
export const App = () => {
  const [insertFile, setInsertFile] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [submitted,setSubmit] = useState(false);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [display, setDisplay] = useState([]);
  const [predictions, setPredictions] = useState(null);

  async function getDuration(formData) {
    try {
      const response = await fetch('/duration', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setDuration(data.duration);
      return data.duration;
    } catch (error) {
      console.error(error);
    }
  }

  async function getChunkPrediction(formData) {
    try {
      const {data} = await axios.post('/chunkLabels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log({ data });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmit(event) {
    if(!audioFile){
      setSubmit(false);
    }
    setSubmit(true);
    event.preventDefault();
    const formData = new FormData();
    formData.append('audio', audioFile);
    setLoading(true);
    const duration = await getDuration(formData);

    const newFormData = new FormData();
    newFormData.append('audio', audioFile.blob);
    newFormData.append('duration',duration);

    await getChunkPrediction(newFormData);
    // const slice_size = 3;
    // let iterations = Math.floor((duration - slice_size) / (slice_size - 1));
    // iterations += 1;
    // let initial_offset = (duration - ((iterations * (slice_size - 1)) + 1)) / 2;
    // let offset;

    // const arr = Array.from({ length: iterations }, (_, index) => index);
    // var promises = arr.map((val, ind) => {
    //   // offset = initial_offset + i * (slice_size - 1);
    //   console.log({ offset });
    //   const formData = new FormData();
    //   formData.append('audio', audioFile);
    //   formData.append('offset', offset);
    //   return (new Promise((res, rej) => {
    //     offset = initial_offset + ind * (slice_size - 1);
    //     console.log({ offset, initial_offset, ind })
    //     getChunkPrediction(formData, offset).then(pred => {
    //       res({ start: pred.offset, end: pred.offset + 3, label: pred.label, id: ind });
    //     }).catch(() => {
    //       rej({ start: "", end: "", label: "Network Error", id: ind });
    //     })
    //   }))
    // })
    // Promise.allSettled(promises).then((res) => {
    //   setDisplay(res);
    // })
    setLoading(false);
  }
  async function handleFileInputChange(event) {
    event.preventDefault();
    let temp = event?.target.value.split('\\')
    setFileName(temp[temp.length-1])
    const file = event?.target?.files[0];
    setAudioFile(file);
    setDisplay([]);
    setDuration(null);
    if (!file) {
      setAudioFile(null);
      setFileName(null);
      setInsertFile(false);
      return
    }
    setSubmit(false);
    setInsertFile(true);

  }
  const inputElement = <input type="file" accept=".wav,.mp3" onChange={handleFileInputChange} />
  if (insertFile) {
    return (
      <>
        <form onSubmit={handleSubmit}>
          {audioFile ? <h4>Choosen File is: {fileName}</h4>: <h4>No file is choosen</h4>}
          {inputElement}
          <input type="submit" value="submit" style={{cursor:'pointer'}}/>
        </form>
        {submitted && (!duration ? <h5>Processing...</h5> : <h5>Audio length : {duration?.toFixed(2)} sec</h5>)}
        {submitted && display &&
          <>
            {display.map((res) => {
              console.log({ res });
              const { start, end, label } = res?.value || {};
              return <h5>{start?.toFixed(2) || ' -- '}-----{end?.toFixed(2) || ' -- '} : {label || 'Processing...'}</h5>
            })}
          </>}
      </>
    )
  }
  return (
    <>
      {audioFile ? <h4>Choosen File is: {fileName}</h4>: <h4>No file is choosen</h4>}
      {inputElement}
      {<button disabled>Submit</button>}
    </>
  )
}
