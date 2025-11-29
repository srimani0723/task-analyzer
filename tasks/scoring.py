from datetime import date
from django.utils.dateparse import parse_date

def calculate_task_score(task_data, all_tasks = None):
    
    score = 0
    today = date.today()
    
    # Urgency 
    due_date = _parse_date(task_data.get('due_date'))
    days_until_due = (due_date - today).days if due_date else 0
    score += _calculate_urgency_score(days_until_due)
    
    # Importance 
    importance = task_data.get('importance', 5)
    score += importance * 4

    # Effort 
    effort = task_data.get('estimated_hours', 1)
    score += _calculate_effort_score(effort)
    
    # Dependencies 
    dependencies = task_data.get('dependencies', [])
    dep_score = _calculate_smart_dependencies_score(dependencies, all_tasks)
    score += dep_score
    
    return score

def _parse_date(date_value):
    
    if isinstance(date_value,date):
        return date_value
    
    parsed = parse_date(str(date_value))
    return parsed if parsed else date.today()


def _calculate_urgency_score(days_until_due):
    if days_until_due < 0:
        return 100 + (abs(days_until_due * 10))
    elif days_until_due <= 2:
        return 50
    elif days_until_due <= 7:
        return 30
    return 10
    

def _calculate_effort_score(hours) :
    if hours <= 1:
        return 20
    elif hours <= 4:
        return 10
    return -5


def _calculate_smart_dependencies_score(dependencies, all_tasks = None) :
    if not dependencies:
        return 15
    
    if not all_tasks:
        return -15
    
    completed_deps = 0
    total_deps = len(dependencies)
    
    for dep_id in dependencies:
        dep_task = next((t for t in all_tasks if t.get('id') == dep_id), None)
        
        if dep_task:
            dep_date = _parse_date(dep_task.get('due_date'))
            dep_days = (dep_date - date.today()).days
            dep_hours = dep_task.get("estimated_hours",1)
            
            if dep_days < 0 or dep_days <= 3 or dep_hours <= 2:
                completed_deps += 1
    
    ratio = completed_deps / total_deps 
    if ratio == 1.0: 
        return 10
    elif ratio >= 0.5: 
        return 0
    return -15