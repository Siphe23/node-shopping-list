const http = require('http');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const filePath = path.join(dataDir, 'shopping-list.json');


if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
}


const getShoppingList = () => {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};

const saveShoppingList = (list) => {
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
};


const server = http.createServer((req, res) => {
    const { method, url } = req;
    let body = '';

   
    if (url === '/shopping-list' && method === 'GET') {
        const shoppingList = getShoppingList();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(shoppingList));

    } else if (url === '/shopping-list' && method === 'POST') {
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const newItem = JSON.parse(body);
            const shoppingList = getShoppingList();
            shoppingList.push(newItem);
            saveShoppingList(shoppingList);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item added', item: newItem }));
        });


    } else if (url.startsWith('/shopping-list/') && (method === 'PUT' || method === 'PATCH')) {
        const id = url.split('/')[2];
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const updatedItem = JSON.parse(body);
            const shoppingList = getShoppingList();
            const index = shoppingList.findIndex(item => item.id === id);

            if (index !== -1) {
                shoppingList[index] = { ...shoppingList[index], ...updatedItem };
                saveShoppingList(shoppingList);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Item updated', item: shoppingList[index] }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Item not found' }));
            }
        });


    } else if (url.startsWith('/shopping-list/') && method === 'DELETE') {
        const id = url.split('/')[2];
        const shoppingList = getShoppingList();
        const filteredList = shoppingList.filter(item => item.id !== id);

        if (shoppingList.length !== filteredList.length) {
            saveShoppingList(filteredList);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item deleted' }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item not found' }));
        }

  
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Route not found' }));
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
