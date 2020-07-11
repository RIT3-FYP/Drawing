using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace Drawing
{


    // Hub
    public class DrawHub : Hub
    {

        // public class Point
        // {
        //     public double X { get; set; }
        //     public double Y { get; set; }
        // }
        // // Class needed

        // public class CurvePath
        // {
        //     public string Id { get; set; }
        //     public string Color { get; set; }
        //     public Int32 Size { get; set; }
        //     public List<Point> points { get; set; }
        // }
        // public class Path
        // {
        //     public string Id { get; set; }
        //     public string Color { get; set; }
        //     public Int32 Size { get; set; }
        //     public List<Point> points { get; set; }
        // }
        // public class Rect
        // {
        //     public string Id { get; set; }
        //     public string Color { get; set; }
        //     public Int32 Size { get; set; }
        //     public string Fill { get; set; }
        //     public List<Point> points { get; set; }

        // }
        // public class Ellipse
        // {
        //     public string Id { get; set; }
        //     public string Color { get; set; }
        //     public Int32 Size { get; set; }
        //     public string Fill { get; set; }
        //     public List<Point> points { get; set; }
        // }
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
        // public async Task StartCurve(){}
        // public async Task 

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}