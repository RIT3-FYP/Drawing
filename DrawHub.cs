using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Drawing
{
     public class User
     {
         public string Id { get; set; }
         public string Name { get; set; }

         public User(string id, string name) => (Id, Name) = (id, name);

     }

     public class Room
     {
         public string Id { get; set; } = Guid.NewGuid().ToString();
         public string Name { get; set; } = "ROOM" + Guid.NewGuid().ToString();
         public int NoOfUsers { get; set; }
         public bool IsEmpty => NoOfUsers == 0;

        public void AddUser()
        {          
            NoOfUsers++;
        }
     }

    // Hub
    public class DrawHub : Hub
    {
        private static List<Room> rooms = new List<Room>();

        public string CreateRoom()
        {
            var room = new Room();
            rooms.Add(room);
            return room.Id;
        }

        public class Point
        {
            public double X { get; set; }
            public double Y { get; set; }
        }
        // Class needed
        // public class DrawObject
        // {
        //     public string Id { get; set; }
        //     public string type { get; set; }
        //     public string Color { get; set; }
        //     public int Size { get; set; }
        //     public string Fill { get; set; }
        //     public List<Point> points { get; set; }
        // }

        public class Command
        {
            public string Name { get; set; }
            public object[] Param { get; set; }
            // public Command(string name, object[] param){
            //     Name = name;
            //     Param = param;
            // }
            public Command(string name, object[] param) => (Name, Param) = (name, param);

        }


        // public async Task SendLine(Point a, Point b, int size, string color)
        // {
        //     commands.Add(new Command("drawLine", new Object[] { a, b, size, color }));
        //     await Clients.Others.SendAsync("ReceiveLine", a, b, size, color);
        // }

        // public async Task SendCurve(Point a, Point b, Point c, int size, string color)
        // {
        //     commands.Add(new Command("drawCurve", new Object[] { a, b, c, size, color }));
        //     await Clients.Others.SendAsync("ReceiveCurve", a, b, c, size, color);
        // }

        // public async Task SendImage(string url)
        // {
        //     commands.Clear();
        //     commands.Add(new Command("drawImage", new Object[] { url }));
        //     await Clients.Others.SendAsync("ReceiveImage", url);
        // }
        // public async Task SendClear()
        // {
        //     commands.Clear();
        //     await Clients.Others.SendAsync("ReceiveClear");
        // }
        private static List<Command> commands = new List<Command>();

        public async Task StartDraw(string id, Point point, string color, string size)
        {
            // commands.Add(new Command("startDraw", new Object[] { id, point, color, size }));
            await Clients.Others.SendAsync("StartDraw", id, point, color, size);
        }
        public async Task Draw(string id, Point pointA, Point pointB)
        {
            // commands.Add(new Command("Draw", new Object[] { id, pointA, pointB }));
            await Clients.Others.SendAsync("Draw", id, pointA, pointB);
        }

        public async Task StartRect(string id, Point point, string color, string size)
        {
            await Clients.Others.SendAsync("StartRect", id, point, color, size);
        }
        public async Task DrawRect(string id, Point point, Point box)
        {
            await Clients.Others.SendAsync("DrawRect", id, point, box);
        }
        public async Task StartCircle(string id, Point point, string color, string size)
        {
            await Clients.Others.SendAsync("StartCircle", id, point, color, size);
        }
        public async Task DrawCircle(string id, Point point, Point box)
        {
            await Clients.Others.SendAsync("DrawCircle", id, point, box);
        }

        public async Task DrawLine(string id, Point point1, Point point2, string color, string size)
        {
            await Clients.Others.SendAsync("DrawLine", id, point1, point2, color, size);
        }
        public async Task PushPoint(Point point)
        {
            await Clients.Others.SendAsync("PushPoint", point);
        }

        public async Task Remove(string id)
        {
            await Clients.Others.SendAsync("Remove", id);
        }
        public async Task RemoveAll()
        {
            await Clients.Others.SendAsync("RemoveAll");
        }
        public async Task Create(string obj)
        {
            await Clients.Others.SendAsync("Create", obj);
        }
        public async Task MoveObject(string id, Object obj){
             await Clients.Others.SendAsync("MoveObject",id, obj);
        }
        
        // List and room connection

        public async Task Start()
        {
            string roomId = Context.GetHttpContext().Request.Query["roomId"];

            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
            }

            await Clients.Group(roomId).SendAsync("Start");
                
        }

        // Update Room List
        private async Task UpdateList(string id = null)
        {
            var list = rooms;

            if (id == null)
            {
                await Clients.All.SendAsync("UpdateList", list);
            }
            else
            {
                await Clients.Client(id).SendAsync("UpdateList", list);
            }
        }

        public override async Task OnConnectedAsync()
        {
            string page = Context.GetHttpContext().Request.Query["page"];

            switch (page)
            {
                case "list": await ListConnected(); break;
                case "draw": await RoomConnected(); break;
            }

            await base.OnConnectedAsync();
        }

        private async Task ListConnected()
        {
            string id = Context.ConnectionId;
            await UpdateList(id);
        }

        private async Task RoomConnected()
        {
            string id = Context.ConnectionId;
            string name = Context.GetHttpContext().Request.Query["name"];
            string roomId = Context.GetHttpContext().Request.Query["roomId"];

            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
                return;
            }

            User newUser = new User(id, name);
            await Groups.AddToGroupAsync(id, roomId);
            //await Clients.Group(roomId).SendAsync("Ready", newUser);
            await UpdateList();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            string page = Context.GetHttpContext().Request.Query["page"];

            switch (page)
            {
                case "list": ListDisconnected(); break;
                case "game": await RoomDisconnected(); break;
            }

            await base.OnDisconnectedAsync(exception);
        }

        private void ListDisconnected()
        {
            // Nothing
        }

        private async Task RoomDisconnected()
        {
            string id     = Context.ConnectionId;
            string roomId = Context.GetHttpContext().Request.Query["roomId"];

            Room room = rooms.Find(r => r.Id == roomId);
            if (room == null)
            {
                await Clients.Caller.SendAsync("Reject");
                return;
            }

            if(room.NoOfUsers == room.NoOfUsers-1){
                await Clients.Group(roomId).SendAsync("Left", id);
            }

            if (room.IsEmpty)
            {
                rooms.Remove(room);
                await UpdateList();
            }
        }
    }
}