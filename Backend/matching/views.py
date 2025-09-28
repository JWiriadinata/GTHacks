from django.shortcuts import render

def lobby(request):
    return render(request, 'matching/lobby.html')

def room(request, pk):
    return render(request, 'matching/room.html', {'room_name': pk})