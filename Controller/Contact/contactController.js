const axios = require("axios");
const fs = require("fs");
const path = './tmp/token.json';

module.exports = {
    getAllContacts: async (req,res) => {
        try {
            let token;
            if(fs.existsSync(path)){               
                let tokenFile = await JSON.parse(fs.readFileSync(path,'utf8'));
                token = tokenFile.access_token;
            }
            else{                
                token = await generateAccessToken();
            }   
            let contactData = await fetchContact(token,req);
            res.json(contactData);
            
        } catch (error) {           
            console.log(error);      
        }       

    }
};

//Generates Access token from Zoho
const generateAccessToken = async () => {
    try {
        const config = {
            method: "POST",
            url: `${process.env.ZOHO_BASE_URL}/oauth/v2/token`,
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                grant_type: "refresh_token",
                client_id: process.env.ZOHO_CLIENT_ID,
                client_secret: process.env.ZOHO_CLIENT_SECRET,
                refresh_token: process.env.ZOHO_REFRESH_TOKEN
            }
        }
        const data = await axios(config);       
        let token={
            access_token: data.data.access_token
        }
        fs.writeFileSync('./tmp/token.json',JSON.stringify(token),(err)=>{
            if(err) throw err;
        });

        return data.data.access_token;

    } catch (error) {
        console.log(error);        
    }

}

//Gets all the contacts from Zoho
const fetchContact = async (token,req) => {
    try {
        const params = req.query;        
        const config = {
            method: "GET",
            url: `https://www.zohoapis.com/crm/v2/Contacts/search`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Zoho-oauthtoken ${token}`
            },
            params: {
                criteria: '(BFH_Desire_PLACE_of_social_care_institution:equals:MOK)',
                page: (params.page) ? params.page : 1,
                per_page: (params.per_page) ? params.per_page : 50               
            }
        }
        const data = await axios(config);

        return data.data;
        
    } catch (error) {
        console.log(error.response.data);  
        if(error.response.data.code=='INVALID_TOKEN'){
            console.log("`````Session Expired. Regenerating Token```````");
            await generateAccessToken();   
            let tokenFile = await JSON.parse(fs.readFileSync('./tmp/token.json','utf8'));
            token = tokenFile.access_token;   
            let data = await fetchContact(token,req);     
            return data;
        }           
    }
}