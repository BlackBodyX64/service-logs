
import axios from 'axios'

const pushToKlock = (payload: any) => {
    let data = JSON.stringify({
        "name": "1",
        "user": "1",
        "snapPic": "1",
        "time": "2024-07-01 08:00:00",
        "temperature": "0.0",
        "serialNumber": ""
    });

    let config = {
        method: 'post',
        url: `${process.env.KLOCK_URL}/receive/alarm`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
}

export default {
    pushToKlock,
}