import numpy as np
import librosa
import soundfile as sf
from scipy.signal import correlate, hann

FRAME_SIZE = 128
HOP_SIZE = 64
WINDOW = hann(FRAME_SIZE, sym=False)

def load_audio(file_path, target_sr=16000):
    audio, sr = librosa.load(file_path, sr=target_sr, mono=True)
    return audio, sr

def normalize(audio):
    return audio / (np.max(np.abs(audio)) + 1e-9)

def align_signals(sig1, sig2):
    correlation = correlate(sig1, sig2, mode='full')
    lag = correlation.argmax() - len(sig2) + 1
    return lag

def pad_and_align(audio1, audio2, lag):
    if lag > 0:
        audio2 = np.pad(audio2, (lag, 0), mode='constant')
    else:
        audio2 = np.pad(audio2, (0, -lag), mode='constant')
    min_len = min(len(audio1), len(audio2))
    return audio1[:min_len], audio2[:min_len]

def framewise_subtract_overlap(base, noise, frame_size=128, hop_size=64):
    output = np.zeros(len(base))
    window_sum = np.zeros(len(base))

    for start in range(0, len(base) - frame_size, hop_size):
        end = start + frame_size
        base_frame = base[start:end] * WINDOW
        noise_frame = noise[start:end] * WINDOW

        if np.dot(noise_frame, noise_frame) < 1e-6:
            cleaned = base_frame
        else:
            scale = np.dot(base_frame, noise_frame) / (np.dot(noise_frame, noise_frame) + 1e-9)
            scale = np.clip(scale, 0.0, 2.0)  # Clamp to avoid distortion
            cleaned = base_frame - scale * noise_frame

        output[start:end] += cleaned * WINDOW
        window_sum[start:end] += WINDOW**2

    # Avoid divide by zero
    window_sum[window_sum == 0] = 1e-9
    output /= window_sum

    return normalize(output)

def main(file1, file2, output_file):
    print("Loading audio files...")
    audio1, sr1 = load_audio(file1)
    audio2, sr2 = load_audio(file2)
    assert sr1 == sr2, "Sampling rates do not match."

    print("Normalizing...")
    audio1 = normalize(audio1)
    audio2 = normalize(audio2)

    print("Aligning audio...")
    lag = align_signals(audio1, audio2)
    print(f"Detected lag: {lag}")

    audio1, audio2 = pad_and_align(audio1, audio2, lag)

    print("Processing with overlap and windowing...")
    cleaned_audio = framewise_subtract_overlap(audio1, audio2, frame_size=FRAME_SIZE, hop_size=HOP_SIZE)

    print("Saving cleaned audio...")
    sf.write(output_file, cleaned_audio, sr1)
    print(f"Cleaned audio saved as: {output_file}")

if __name__ == "__main__":
    file1 = "mic.wav"
    file2 = "system.wav"
    output = "cleaned_output.wav"
    main(file1, file2, output)
