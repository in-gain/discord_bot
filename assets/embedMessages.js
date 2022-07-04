

exports.scheduledMessage = (client,date) => {
    const dayOfWeekArr = ['日','月','火','水','木','金','土'];
    const formattedDate = `${date.getMonth()+1}/${date.getDate()}(${dayOfWeekArr[date.getDay()]})  ${date.getHours()}:00`;
    const ret = {
        embeds: [{
            author: {
                name: "定例会告知bot",
            },
            title: `定例会　${formattedDate}`,
            description:`次回のTRPG定例会は ${formattedDate}です。\n
            参加できそうな人は、下記URLから「興味あり」ボタンを押しておいてください。\n`,
            color:0x8dbbff,
            footer:{
                icon_url: client.user.avatarURL,
                text: "スケジュール管理を楽にしたいbot"
            },
            fields:[]
        }]
    }
    return ret;
}