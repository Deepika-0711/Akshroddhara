/**
 * Provides built-in sample damaged Kannada historical documents
 * for quick testing and evaluation without needing manual file hunting.
 */

// Generate realistic SVG-based test images converted to Blob/File objects
export const createSampleImage = (type) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (type === 'palm-leaf') {
    canvas.width = 640;
    canvas.height = 180;

    // Palm leaf background: dark weathered fibrous brown tones
    const grad = ctx.createLinearGradient(0, 0, 640, 0);
    grad.addColorStop(0, '#7A5B38');
    grad.addColorStop(0.3, '#94724A');
    grad.addColorStop(0.7, '#83633E');
    grad.addColorStop(1, '#6F5030');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Horizontal leaf fiber streaks
    ctx.fillStyle = 'rgba(50, 30, 15, 0.25)';
    for (let i = 0; i < 40; i++) {
      const y = Math.random() * canvas.height;
      const h = 1 + Math.random() * 2;
      ctx.fillRect(0, y, canvas.width, h);
    }

    // Incised characters with low contrast
    ctx.font = '28px "Noto Serif Kannada", serif';
    ctx.fillStyle = 'rgba(40, 25, 10, 0.75)';
    ctx.fillText('॥ ಶ್ರೀಮತ್ ಪರಮ ಗಂಭೀರ ಸ್ಯಾದ್ವಾದಾಮೋಘ ಲಾಂಛನಂ ॥', 30, 60);
    ctx.fillText('ಜೀಯಾತ್ ತ್ರೈಲೋಕ್ಯನಾಥಸ್ಯ ಶಾಸನಂ ಜಿನ ಶಾಸನಂ ॥ ೧ ॥', 30, 110);
    ctx.fillText('ವಿಕ್ರಮ ವರ್ಷ ೧೦೧೨ನೆಯ ಕಾಲದ ತಾಳೆಗರಿ ಹಸ್ತಪ್ರತಿ ಸಂರಕ್ಷಣೆ...', 30, 150);

    // Vignette / uneven edge decay
    ctx.fillStyle = 'rgba(25, 15, 5, 0.35)';
    ctx.fillRect(0, 0, 40, canvas.height);
    ctx.fillRect(600, 0, 40, canvas.height);
  } else if (type === 'stone-rubbing') {
    canvas.width = 560;
    canvas.height = 260;

    // Stone rubbing paper background: textured grayish charcoal off-white
    ctx.fillStyle = '#E3DED4';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Paper wrinkles and ink splatter noise
    for (let i = 0; i < 1500; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const s = Math.random() * 2.5;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(70, 70, 70, 0.15)' : 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(x, y, s, s);
    }

    // Stone inscription Kadamba/Ganga script rubbing
    ctx.font = 'bold 32px "Noto Serif Kannada", serif';
    ctx.fillStyle = '#2B2B2B';
    ctx.fillText('ಶ್ರೀ ಮತ್ ಕದಂಬಾನಾಂ ಪಟ್ಟಮಹಾ', 35, 70);
    ctx.fillText('ದೇವಿಯರ್ ವಿಜಯ ರಾಜ್ಯೋದಯ...', 35, 130);
    ctx.fillText('ಧರ್ಮ ಪ್ರತಿಪಾಲನಾರ್ಥಂ ಕೊಟ್ಟ ದತ್ತಿ', 35, 190);
    ctx.font = 'italic 20px "Noto Sans Kannada", sans-serif';
    ctx.fillStyle = '#4A4A4A';
    ctx.fillText('— ಹಲ್ಮಿಡಿ ಶಾಸನದ ಮಾದರಿ ಕಲ್ಲುಬಂಡೆಯ ಮುದ್ರಣ', 35, 235);
  } else {
    // Faded aged paper print (19th century book)
    canvas.width = 520;
    canvas.height = 300;

    // Aged yellow paper
    ctx.fillStyle = '#F5E6C9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Water stains
    const stain = ctx.createRadialGradient(400, 100, 20, 400, 100, 140);
    stain.addColorStop(0, 'rgba(180, 140, 80, 0.4)');
    stain.addColorStop(0.7, 'rgba(180, 140, 80, 0.15)');
    stain.addColorStop(1, 'transparent');
    ctx.fillStyle = stain;
    ctx.beginPath();
    ctx.arc(400, 100, 140, 0, Math.PI * 2);
    ctx.fill();

    // Faded print text
    ctx.font = '24px "Noto Serif Kannada", serif';
    ctx.fillStyle = 'rgba(80, 65, 45, 0.85)';
    ctx.fillText('ಕರ್ಣಾಟ ಸಂಸ್ಕೃತಿ ಮತ್ತು ಸಾಹಿತ್ಯ ಪರಂಪರೆ', 40, 60);
    ctx.fillText('ಕವಿರಾಜಮಾರ್ಗಂ ಮೊದಲಾದ ಪ್ರಾಚೀನ ಗ್ರಂಥಗಳ', 40, 110);
    ctx.fillText('ವಸ್ತುಸ್ಥಿತಿಯನ್ನು ಈ ಗ್ರಂಥದಲ್ಲಿ ವಿವರಿಸಲಾಗಿದೆ.', 40, 160);

    // Heavily faded lines
    ctx.fillStyle = 'rgba(120, 100, 75, 0.45)';
    ctx.fillText('ಕಾವ್ಯಪ್ರಯೋಗ ಪರಿಣತಮತಿಗಳ್ ಕನ್ನಡಿಗರ್...', 40, 220);
    ctx.fillText('ಅಳಿದ ಅಕ್ಷರಗಳ ಪುನರುಜ್ಜೀವನ ಪರೀಕ್ಷಾ ಪ್ರತಿ ೧೮೯೨', 40, 265);
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const filename =
        type === 'palm-leaf'
          ? 'talagari_manuscript_sample.png'
          : type === 'stone-rubbing'
          ? 'shilashasana_rubbing_sample.png'
          : 'faded_1892_print_sample.png';
      const file = new File([blob], filename, { type: 'image/png' });
      resolve({ file, dataUrl: canvas.toDataURL('image/png') });
    }, 'image/png');
  });
};
