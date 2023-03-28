from flask import Flask, request
import librosa
import noisereduce as nr
import numpy as np
import tensorflow as tf
app = Flask(__name__)

predNumToLabel = ['artifact','extrahls','extrastole','murmur','normal']
model = tf.keras.models.load_model('./CNN2-FYP/CNN2')

@app.route('/duration', methods=['POST'])
def duration():
    file = request.files['audio']
    audio_data, sr = librosa.load(file, sr=None, mono=True)
    duration = librosa.get_duration(y = audio_data)
    return {"duration":duration}

@app.route('/chunkLabels',methods=['POST'])
def chunkLabels():
    def extract_features(audio_file,offset):
        audio, sr = librosa.load(audio_file, offset=offset, duration=3)

        #remove bg noise
        audio = nr.reduce_noise(y=audio, sr=sr)

        #spectogram
        S = librosa.feature.melspectrogram(y = audio, sr=sr, n_fft=2048, 
                                    hop_length=512, 
                                    n_mels=128)
        
        #feature extraction mfcc
        mfccs = librosa.feature.mfcc(S=librosa.power_to_db(S), n_mfcc=40)
        return mfccs
    
    audio_file = request.files['audio']
    offset = request.form.get('offset', default=0, type=float)
    quantum = np.asarray(extract_features(audio_file,offset))
    quantum = quantum.reshape(1, quantum.shape[0], quantum.shape[1], 1)
    prediction = model.predict(quantum)
    labelNum = np.argmax(prediction[0])
    return {"predLabel":predNumToLabel[labelNum]}
if __name__ == "__main__":
    app.run(debug=True)