import pandas as pd

students = pd.read_csv("Student_data.csv")

# check distinct major values
majors = students["Major"]
distinct_majors = majors.unique()
print(distinct_majors)

# new column 1: Major_Type (Technical vs. Non-technical)
def categorize_major(major: str) -> str:
    """Categorize college majors into technical or non-technical"""
    if (major == "Engineering") or (major == "Mathematics") or (major == "Computer Science"):
        return "Technical"
    elif (major == "Business") or (major == "Economics") or (major == "Psychology"):
        return "Non-technical"
    else:
        return "N/A"

students["Major_Type"] = students.apply(lambda row: categorize_major(row["Major"]), axis=1)

# new column 2: GPA_Change (Final_CGPA − Previous_GPA)
students["GPA_Change"] = students.apply(lambda row: round(row["Final_CGPA"] - row["Previous_GPA"], 2), axis=1)

# change social hours to get daily average: Social_Hours_Per_Day (Social_Hours_Week / 7)
students["Social_Hours_Week"] = students["Social_Hours_Week"].apply(lambda hours: round(hours / 7, 2))

# rename sleep and social hours columns for consistency
students.rename(columns={"Social_Hours_Week": "Social_Hours_Per_Day"}, inplace=True)
students.rename(columns={"Sleep_Hours": "Sleep_Hours_Per_Day"}, inplace=True)

students.to_csv("student_data_cleaned.csv", index=False)