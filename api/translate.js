export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, lang } = req.body;
  const token = process.env.HF_TOKEN;

  // MODEL_MAP extended for Hindi and Odia
  const MODEL_MAP = {
    hin_Deva: {
      model: "facebook/nllb-200-distilled-600M",
      src: "eng_Latn",
      tgt: "hin_Deva",
    },
    ory_Orya: {
      model: "facebook/nllb-200-distilled-600M",
      src: "eng_Latn",
      tgt: "ory_Orya",
    },
    // Update here when supporting new language, or a different model to try. Also check the index.html
  };

  const config = MODEL_MAP[lang];
  if (!config) {
    return res.status(400).json({ error: "Unsupported language: " + lang });
  }

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${config.model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          src_lang: config.src,
          tgt_lang: config.tgt,
        },
      }),
    });

    const data = await response.json();
    const translation = (data && data[0] && data[0].translation_text) || "No translation";

    res.status(200).json({ translation });
  } catch (err) {
    console.error("Error in translation handler:", err);
    res.status(500).json({ error: "Translation failed" });
  }
}
