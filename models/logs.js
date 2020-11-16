module.exports = (sequelize, type) => {
    return sequelize.define('logs', {
        id: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: type.INTEGER
        },
        appId: {
            type: type.INTEGER
        },
        action : {
            type: type.ENUM('Upload', 'Download')
        },
        fileName: {
            type: type.STRING
        },
        filePath: {
            type: type.STRING
        }
    })
}