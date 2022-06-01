exports.scheduledMessage = (client,date) => {
    const ret = {
        embeds: [{
            author: {
                name: "定例会管理bot",
            },
            title: `定例会　${date}`,
            description:`次回の定例会は ${date}です。\n
            参加できる人は、下記URLからイベントに参加してください。\n`,
            color:0x8dbbff,
            footer:{
                icon_url: client.user.avatarURL,
                text: "スケジュール管理を楽にした委員会"
            },
            fields:[]
        }]
    }
    return ret;
}