//创建标准帧
let standardFrame = null;

navigator.mediaDevices.getDisplayMedia({ video: true })
  .then(stream => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.onloadedmetadata = () => {
      video.play();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // 截取第一帧作为标准帧
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      standardFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // 总像素量的一半
      const totalPixels = canvas.width * canvas.height;
      const threshold = totalPixels * 0.5;

      // 每1000ms截取一帧并与标准帧比较
      setInterval(() => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // 计算像素差距
        let diffCount = 0;
        for (let i = 0; i < standardFrame.data.length; i += 4) {
          const r1 = standardFrame.data[i];
          const g1 = standardFrame.data[i + 1];
          const b1 = standardFrame.data[i + 2];
          const r2 = currentFrame.data[i];
          const g2 = currentFrame.data[i + 1];
          const b2 = currentFrame.data[i + 2];

          if (r1 !== r2 || g1 !== g2 || b1 !== b2) {
            diffCount++;
          }
        }

        // 输出变化的像素量
        console.log(`Pixel differences: ${diffCount}`);

        // 如果变化的像素量达到总像素量的50%，则下载新的帧，并更新标准帧
        if (diffCount >= threshold) {
          const imgData = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          document.body.appendChild(a);
          a.href = imgData;
          a.download = 'diff.png';
          a.click();
          document.body.removeChild(a);

          standardFrame = currentFrame;
        }
      }, 1000);
    };
  });
