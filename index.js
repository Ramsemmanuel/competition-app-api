const mysql = require('mysql');
const express = require('express');
var app = express();
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require("cors");
const bcrypt = require('bcrypt');

var PORT = process.env.PORT || 3000;

const saltRounds = 10;

app.use(bodyparser.json());
app.use(cookieParser());
app.use(session({ secret: 'competition', resave: false, saveUninitialized: false }));

var corsOptions = {
    origin: "*"
};
  
app.use(cors(corsOptions));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    // password: 'root',
    //comment password because it doesnt connect on windows
    database: 'competitiondb',
    port: 3306,
    multipleStatements: true
});

const dbSetup = () => {
    let tables = [
        {
            tableName: 'users',
            fields: [
                {fieldName: 'id', type: 'VARCHAR(255)', required: true},
                {fieldName: 'bio', type: 'VARCHAR(255)', required: false},
                {fieldName: 'alternateCellNumber', type: 'VARCHAR(255)', required: false},
                {fieldName: 'cellNumber', type: 'VARCHAR(255)', required: false},
                {fieldName: 'dateOfBirth', type: 'VARCHAR(255)', required: false},
                {fieldName: 'email', type: 'VARCHAR(255)', required: true},
                {fieldName: 'imageUrl', type: 'VARCHAR(255)', required: false},
                {fieldName: 'firstName', type: 'VARCHAR(255)', required: true},
                {fieldName: 'lastName', type: 'VARCHAR(255)', required: false},
                {fieldName: 'idDocument', type: 'VARCHAR(255)', required: false},
                {fieldName: 'userType', type: 'VARCHAR(255)', required: false},
                {fieldName: 'nationality', type: 'VARCHAR(255)', required: false},
                {fieldName: 'password', type: 'VARCHAR(255)', required: true},
                {fieldName:'dateAdded', type:'VARCHAR(255)', required: false},
                {fieldName:'userGroup', type:'VARCHAR(255)', required: false},
            ]
        },
        {
            tableName: 'competitionEntries',
            fields: [
                {fieldName:'id', type: 'VARCHAR(255)', required:  true},
                {fieldName:'imageUrl', type: 'VARCHAR(255)', required:  true},
                {fieldName:'userId', type: 'VARCHAR(255)', required:  true},
                {fieldName:'artworkDescription', type: 'VARCHAR(255)', required: false},
                {fieldName:'competitionId', type: 'VARCHAR(255)', required:  true},
                {fieldName:'entryDate', type: 'VARCHAR(255)', required: false}
            ]
        },
        {
            tableName: 'artworks',
            fields: [
                {fieldName:'id', type:'VARCHAR(255)', required: false},
                {fieldName:'artworkDescription', type:'VARCHAR(255)', required: false},
                {fieldName:'artworkSize', type:'VARCHAR(255)', required: false},
                {fieldName:'artworkMedium', type:'VARCHAR(255)', required: false},
                {fieldName:'artworkEditionNo', type:'VARCHAR(255)', required: false},
                {fieldName:'dateAdded', type:'VARCHAR(255)', required: false},
                {fieldName:'imageUrl', type:'VARCHAR(255)', required: false},
                {fieldName:'userId', type:'VARCHAR(255)', required: false}
            ]
        },
        {
            tableName: 'entries',
            fields: [
                {fieldName:'id', type:'VARCHAR(255)', required: false},
                {fieldName:'artworkDescription', type:'VARCHAR(255)', required: false},
                {fieldName:'artworkId', type:'VARCHAR(255)', required: false},
                {fieldName:'artworkSize', type:'VARCHAR(255)', required: false},
                {fieldName:'artworkMedium', type:'VARCHAR(255)', required: false},
                {fieldName:'artworkEditionNo', type:'VARCHAR(255)', required: false},
                {fieldName:'dateAdded', type:'VARCHAR(255)', required: false},
                {fieldName:'imageUrl', type:'VARCHAR(255)', required: false},
                {fieldName:'competitionId', type:'VARCHAR(255)', required: false},
                {fieldName:'entryDate', type:'VARCHAR(255)', required: false},
                {fieldName:'userId', type:'VARCHAR(255)', required: false}
            ]
        },
        {
            tableName: 'votes',
            fields: [
                {fieldName: 'id', type:'VARCHAR(255)', required: false},
                {fieldName: 'competitionId', type:'VARCHAR(255)', required: false},
                {fieldName: 'dateAdded', type:'VARCHAR(255)', required: false},
                {fieldName: 'modifiedDate', type:'VARCHAR(255)', required: false},
                {fieldName: 'voterId', type:'VARCHAR(255)', required: false},
                {fieldName: 'entryUserId', type:'VARCHAR(255)', required: false},
                {fieldName: 'vote', type:'VARCHAR(255)', required: false},
            ]
        },
        {
            tableName: 'judgeViews',
            fields: [
                {fieldName:'id', type:'VARCHAR(255)', required: true},
                {fieldName:'userId', type:'VARCHAR(255)', required: false},
                {fieldName: 'comment', type: 'VARCHAR(255)', required: false},
                {fieldName: 'reason', type: 'VARCHAR(255)', required: false},
            ]
        }
    ];

    tables.forEach(table => {
        createTables(table);
    });

    // const queryString = `INSERT INTO users (id, bio, alternateCellNumber, cellNumber, dateOfBirth, email, imageUrl, firstName, lastName, idDocument, userType, nationality, password) VALUES ('', NULL, NULL, NULL, NULL, NULL, 'test1@sightdigital.co.za', NULL, 'Adjudicator', 'RAMANYIMI', NULL, 'JUDGE', 'SOUTH AFRICA', '$2a$04$E6/XiSb3yalC7gnHBpa9N.8g4ZTGMZAKpSZonQrjPcGI8u4nxgTrC')`;
    // mysqlConnection.query(queryString, function (err, result) {
    //     if (err) {
    //         console.log("An error occurred.");
    //     } else {
    //         console.log("1 record successfully inserted into db");
    //     }
    // });

    //Update User Adjudicator
    const queryString =`UPDATE users set userType='JUDGE' WHERE email = 'test@sightdigital.co.za , test2@sightdigital.co.za'`;
    mysqlConnection.query(queryString, function (err, result) {
    if (err) {
    console.log("fail to update usertype judge. An error occurred.");
    } else {
    console.log("Judge table updated record successfully on db");
    }
    });

}



const createQuery = (table) => {
    let queries = [];
    table.fields.forEach((field) => {
        queries.push(`${field.fieldName} ${field.type} ${field.required ? 'NOT NULL' : ''}`);
    });
    return `CREATE TABLE ${table.tableName} (${queries.join(',')})`
}

const updateTable = (table, field) => {
  return `ALTER TABLE ${table} ADD ${field.fieldName} ${field.type} ${field.required ? 'NOT NULL' : ''}`
}


const addMissingFields = (table) => {
    let query = '';
    table.fields.forEach((field) => {
        query = `SHOW COLUMNS FROM ${ table.tableName } WHERE field = '${field.fieldName}'`;

        mysqlConnection.query(query, (error, results) => {
            if(results) {
                if(results[0]) {
                    // console.log(table.tableName, results[0].Field);
                }
                else {
                    mysqlConnection.query(updateTable(table.tableName, field), (err, result) => {
                        if (!err) {
                            console.log(`column ${ field.fieldName } added`);
                        }
                        else {
                            console.log(err);
                        }
                    });
                }
            }
        })
    });
}

const createTables = (table) => {
    mysqlConnection.query(`SHOW TABLES LIKE '${ table.tableName }'`, (error, results) => {
        if(error) {
            return console.log(error);
        }
        else {
            if(results.length < 1) {
                mysqlConnection.query(createQuery(table), (err, result) => {
                    if (!err) {
                        console.log(`table ${ table.tableName }  created`);
                    }
                    else {
                        console.log(err);
                    }
                });
            }
            else {
                addMissingFields(table);
            }
        } 
    });
};

mysqlConnection.connect((err) => 
    !err ? dbSetup() : console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2))
);

app.listen(PORT, () => console.log('Express server is runnig at port no : 3000'));

// Get user
app.post('/get-user', (req, res) => {
    let userId = req.body.id;
    mysqlConnection.query(`SELECT * FROM users WHERE id = '${userId}' `, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }

    })
});

// Get user by email
app.post('/get-user-by-email', (req, res) => {
    let email = req.body.email;
    mysqlConnection.query(`SELECT * FROM users WHERE email = '${email}' `, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }

    })
});

//Add artwork
app.post('/add-artwork', (req, res) => {
    let artworkData = req.body;
    mysqlConnection.query('INSERT INTO artworks SET ?', artworkData, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

//Get all artworks
app.get('/artworks', (req, res) => {
    mysqlConnection.query('SELECT * FROM artworks', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

app.post('/user-artworks', (req, res) => {
    let userId = req.body.id;
    mysqlConnection.query(`SELECT * FROM artworks WHERE userId = '${userId}' ORDER BY dateAdded DESC`, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

app.post('/user-artwork', (req, res) => {
    mysqlConnection.query(`SELECT * FROM artworks WHERE id = '${req.body.id}'`, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            res.send({
                "code":204,
                "success":"No work found"
            });
        }
    })
});


//Delete artworks
app.post('/delete-artwork', (req, res) => {
    let workId = req.body.id;
    mysqlConnection.query(`DELETE FROM artworks WHERE id = '${workId}'`, (err, rows, fields) => {
        if (!err) {
            res.send({
                "code":200,
                "data": rows[0],
                "message":"Deleted successfully"
            });
        }
        else {
            console.log(err);
        }
    })
});

//Update a users
app.put('/update-artwork', (req, res) => {
    let artWorkData = req.body;
    mysqlConnection.query(`UPDATE artworks SET ? WHERE id = '${artWorkData.id}'`, artWorkData, (err, results, fields) => {
        if (results) {
            res.send({
                "code":200,
                "data": results[0],
                "message":"Updated successfully"
            });
        }
        else {
            console.log(err);
        }
    })
});


//Get all artworks
app.get('/users', (req, res) => {
    mysqlConnection.query(`SELECT * FROM users`, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});
//Insert a users
app.post('/create-user', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err,   hash) {
        let profileData = req.body;
        profileData.password = hash;
        mysqlConnection.query('SELECT * FROM users WHERE email = ?', [profileData.email], (error, results, fields) => {
            if(results.length > 0) {
                res.send({
                    "code":204,
                    "message":"This email already exist, please try to login"
                });
            }
            else {
                mysqlConnection.query('INSERT INTO users SET ?', profileData, (err, results, fields) => {
                    if (!err) {
                        res.send({
                            "code":200,
                            "data": results[0],
                            "message":"User registered successfully"
                        });
                    }
                    else { console.log(err); }
                })
            }
        })

    });
});


//Update a users
app.put('/update-user', (req, res) => {
    delete(req.body.password)
    mysqlConnection.query(`UPDATE users SET ? WHERE id = '${req.body.id}'`, req.body, (err, results, fields) => {
        if (results) {
            res.send({
                "code":200,
                "data": results[0],
                "message":"Updated successfully"
            });
        }
        else {
            console.log(err);
            res.send({
                "code":err.errno,
                "data": err.sqlMessage,
                "message":"Error occured while updating record"
            });
        }
    });
});

//Search user based on criteria

app.post('/usersearch', (req, res) => {
    var d = req.body;
    var sql = "SELECT * FROM users WHERE (usertype = 'JUDGE' OR usertype = 'ARTIST' OR usertype is null )  ";
    var conditions = []
    Object.keys(d).map((k)=>{
        if(d[k])
            conditions.push(k+" LIKE '%"+d[k]+"%'")
    })

    if(conditions.length)
        sql += ' AND '+ conditions.join(' AND ');  
        
    mysqlConnection.query(sql, (err, users, fields) => {
        if (!err) {
           res.send(users);
        }
        else {
            console.log(err);
        }
    })
});

app.post('/artistsearch', (req, res) => {
    var d = req.body;
    var sql = "SELECT * FROM users WHERE (usertype = 'ARTIST' OR usertype is null )  ";
    var conditions = []
    Object.keys(d).map((k)=>{
        if(d[k])
            conditions.push(k+" LIKE '%"+d[k]+"%'")
    })

    if(conditions.length)
        sql += ' AND '+ conditions.join(' AND ');  
        
    console.log(sql);
    mysqlConnection.query(sql, (err, users, fields) => {
        if (!err) {
           res.send(users);
        }
        else {
            console.log(err);
        }
    })
});

app.post('/login', (req, res) => {
    let userData = req.body;
    mysqlConnection.query('SELECT * FROM users WHERE email = ?', [userData.email], (error, results, fields) => {
        if (error) {
            res.send({
              "code":400,
              "failed":"error ocurred"
            })
          }
          else {
            if(results.length > 0) {
                bcrypt.compare(userData.password.toString(), results[0].password).then(function(passwordMatch) {
                    console.log(passwordMatch);
                    if(passwordMatch) {
                        res.send({
                            "code":200,
                            "data": results[0],
                            "success":"login sucessfull"
                        });
                    }
                    else {
                        res.send({
                            "code":204,
                            "success":"Email and password does not match"
                        });
                    }
                });
            }

            else {
                res.send({
                    "code":204,
                    "success":"User does not exist"
                });
            }  
        }
    })
});


//Insert entry
app.post('/competition-entry', (req, res) => {
    let entryData = req.body;
    mysqlConnection.query('INSERT INTO entries SET ?', entryData, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

// Get user arkwork entries
app.post('/user-entries', (req, res) => {
    let userId = req.body.userId;
    mysqlConnection.query(`SELECT * FROM entries WHERE userId = '${userId}'`, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});


app.get('/entries-user-ids', (req, res) => {
    mysqlConnection.query('SELECT DISTINCT userId FROM entries', (err, entries, fields) => {
        if (!err) {
            let mappedData = entries.map(function(item){
                return `'${item.userId}'`;
            }).join(',');
            
            let query = `SELECT * FROM users WHERE id IN (${ mappedData })`;
            mysqlConnection.query(query, (err, users, fields) => {
                res.send(users);
            });
        }
        else {
            console.log(err);
        }
    })
});

//Get all artworks
app.get('/entries', (req, res) => {
    mysqlConnection.query('SELECT * FROM entries', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

//Update a users
app.put('/update-entry', (req, res) => {
    let entryData = req.body;
    mysqlConnection.query(`UPDATE entries SET ? WHERE id = '${entryData.id}'`, entryData, (err, results, fields) => {
        if (results) {
            res.send({
                "code":200,
                "data": results[0]
            });
        }
        else {
            console.log(err);
        }
    })
});

// =================================================================================== //

//Get all votes
app.get('/votes', (req, res) => {
    mysqlConnection.query('SELECT * FROM votes', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

// VOTES
app.post('/add-vote', (req, res) => {
    let entryData = req.body;
    mysqlConnection.query('INSERT INTO votes SET ?', entryData, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

//Update a users
app.put('/update-vote', (req, res) => {
    let voteData = req.body;
    mysqlConnection.query(`UPDATE votes SET ? WHERE id = '${voteData.id}'`, voteData, (err, results, fields) => {
        if (results) {
            res.send({
                "code":200,
                "data": results[0]
            });
        }
        else {
            console.log(err);
        }
    })
});

//Get all Views
app.post('/view', (req, res) => {
    mysqlConnection.query(`SELECT * FROM judgeViews WHERE userId = '${req.body.userId}'`, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

// Views
app.post('/add-view', (req, res) => {
    let viewsData = req.body;
    mysqlConnection.query('INSERT INTO judgeViews SET ?', viewsData, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

app.put('/update-view', (req, res) => {
    let viewsData = req.body;
    mysqlConnection.query(`UPDATE judgeViews SET ? WHERE id = '${viewsData.id}'`, viewsData, (err, results, fields) => {
        if (results) {
            res.send({
                "code":200,
                "data": results[0]
            });
        }
        else {
            console.log(err);
        }
    })
});
