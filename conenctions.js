const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

app.post('/api/linkedin-post', async (req, res) => {
  const { text } = req.body;
  
  // Your LinkedIn OAuth access token with permissions to post on company page
  const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;  
  
  // Your LinkedIn company organization URN for Trigger.dev 
  // Replace '12345678' with your actual company ID
  const LINKEDIN_ORGANIZATION_URN = 'urn:li:organization:12345678'; 

  if (!LINKEDIN_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'LinkedIn access token missing.' });
  }

  try {
    const postBody = {
      author: LINKEDIN_ORGANIZATION_URN,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postBody,
      {
        headers: {
          Authorization: `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ message: 'LinkedIn post published', postId: response.data.id });
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Start your server as usual
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
