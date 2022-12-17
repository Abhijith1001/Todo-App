const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

mongoose.connect("mongodb+srv://admin-abhijith:1234@cluster0.qi4dors.mongodb.net/todolistDB", { useNewUrlParser: true });

var conn = mongoose.connection;


conn.on('connected', function () {
    console.log('database is connected successfully');
});


const itemsSchema = new mongoose.Schema(
    {
        name: String
    }
)


const Item = mongoose.model('Item', itemsSchema);


const item = new Item({
    name: "coding"
})

const item1 = new Item({
    name: "reading"
})

const item2 = new Item({
    name: "walking"
})

const defaultItems = [item, item1, item2];


const listSchema = {
    name: String,
    items: [
        itemsSchema
    ]
}

const List = mongoose.model("List", listSchema)


app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set('view engine', 'ejs');

app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("success");
                }
            })
            res.redirect("/");
        } else {
            res.render("list", { kindofday: "Today", items: foundItems })
        }

    })
})


app.post("/", function (req, res) {

    const itemName = req.body.data;

    const listName = req.body.list;

    const item = new Item({
        name: itemName
    })

    if (listName === "Today") {
        item.save();

        res.redirect("/");
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName)
        })
    }
})

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;


    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err)
            }
            else {
                console.log("Deleted");
                res.redirect("/");
            }
        })
    } else {
        List.findOneAndUpdate({ name: listName },
             {$pull: {items: {_id: checkedItemId}}},
             function(err,foundList){
                if(!err){
                    res.redirect("/" + listName);
                }
            })
            
    }


})

app.get("/:customListName", function (req, res) {

    const customListName =_.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();

                res.redirect("/" + customListName)
            } else {
                res.render("list", { kindofday: foundList.name, items: foundList.items })

            }
        }
    })
})

app.get("/about", function (req, res) {
    res.render("about");
})


app.listen(3000, function () {
    console.log("server is ready");
})

