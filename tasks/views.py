from django.shortcuts import render
from django.http import HttpResponse, JsonResponse,HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
import json
from .scoring import calculate_task_score


# Create your views here.

@csrf_exempt
def analyze_tasks(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)

    try:
        tasks_data = json.loads(request.body)
        
        # Add IDs if missing
        for i, task in enumerate(tasks_data):
            if 'id' not in task:
                task['id'] = i + 1
        
        # Score all tasks with full context
        scored_tasks = []
        for task in tasks_data:
            score = calculate_task_score(task, tasks_data)
            task_copy = task.copy()
            task_copy['score'] = score
            scored_tasks.append(task_copy)
        
        sorted_tasks = sorted(scored_tasks, key=lambda x: x['score'], reverse=True)
        
        for i, task in enumerate(sorted_tasks):
            task['rank'] = i+1
        
        return JsonResponse(sorted_tasks, safe=False)
        
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")
    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")

@csrf_exempt
def suggest_tasks(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST only'}, status=405)

    try:
        tasks_data = json.loads(request.body)
        for i, task in enumerate(tasks_data):
            if 'id' not in task:
                task['id'] = i + 1
        
        scored_tasks = []
        for task in tasks_data:
            score = calculate_task_score(task, tasks_data)
            task_copy = task.copy()
            task_copy['score'] = score
            scored_tasks.append(task_copy)
        
        sorted_tasks = sorted(scored_tasks, key=lambda x: x['score'], reverse=True)
        top_three = sorted_tasks[:3]
        
        explanation = "The top 3 scored by the Algo using the Urgent + (Importance * 4) + effort + dependencies with a custom scoring according to human psycology"
        
        return JsonResponse({
            'top_tasks': top_three, 
            'explanation': explanation,
            'total_tasks': len(tasks_data)
        })
        
    except Exception as e:
        return HttpResponseBadRequest(f"Error: {str(e)}")