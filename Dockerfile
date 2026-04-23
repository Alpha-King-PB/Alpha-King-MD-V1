# 1. Node.js පරිසරය තෝරා ගැනීම
FROM node:18

# 2. වැඩ කරන Folder එක සකස් කිරීම
WORKDIR /app

# 3. Package files copy කිරීම
COPY package*.json ./

# 4. Libraries ඔක්කොම Install කිරීම (ඔයා කියපු ffmpeg වගේ ඒවත් මෙතනදී ඉන්ස්ටෝල් වෙයි)
RUN npm install

# 5. බොට්ගේ සියලුම files copy කිරීම
COPY . .

# 6. Hugging Face එකට අවශ්‍ය Port එක
EXPOSE 7860

# 7. බොට්ව පණගැන්වීම
CMD ["node", "index.js"]
