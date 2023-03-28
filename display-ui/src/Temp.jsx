import React from 'react'

export const Temp = ()=> {
    async function handleFileInputChange(event) {
        console.log(event.target.files[0]);
    }
    return (
        <div><input type="file" accept=".wav,.mp3" onChange={handleFileInputChange} /></div>
    )
}
