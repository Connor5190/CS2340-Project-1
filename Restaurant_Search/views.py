from django.shortcuts import render

# Create your views here.

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages

def login_view(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('profile')
        else:
            return render(request, 'Restaurant_Search/login.html', {'error': 'Invalid credentials'})
    return render(request, 'Restaurant_Search/login.html')

@login_required
def profile_view(request):
    return render(request, "Restaurant_Search/profile.html", {'user': request.user})

def signup_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)  # 1
        if form.is_valid():  # 2
            user = form.save()  # 3
            login(request, user)  # 4
            messages.success(request, "Account created successfully!")  # 5
            return redirect('profile')  # 6
    else:
        form = UserCreationForm()  # 7
    return render(request, 'Restaurant_Search/signup.html', {'form': form})
