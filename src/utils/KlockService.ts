
import axios from 'axios'

export interface KlockAlarm {
    user: string
    pic: string
    cameraName: string
    time: string
    temperature: string
}

const pushToKlock = async (payload: KlockAlarm) => {
    let data = JSON.stringify({
        "user": payload.user,
        "pic": payload.pic,
        "cameraName": payload.cameraName,
        "time": payload.time,
        "temperature": payload.temperature
    });

    let config = {
        method: 'post',
        url: `${process.env.KLOCK_URL}/receive/alarm`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const response = await axios.request(config)
        console.log(JSON.stringify(response.data));
        return 'ok'
    } catch (error) {
        console.log(error);
        return 'error'
    }
}

export default {
    pushToKlock,
}